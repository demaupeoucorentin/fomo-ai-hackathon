// Anthropic adapters — ICP generation + comparator email writing.
// Model: claude-sonnet-5. Uses tool_use to force valid structured JSON output
// (far more reliable than asking for JSON in prose and parsing it).
import Anthropic from "@anthropic-ai/sdk";
import type { Persona } from "../../../core/domain/entities";
import { ProviderError } from "../../../core/domain/errors";
import { HEADCOUNT, SENIORITY } from "../../../core/domain/persona-vocab";
import type {
  EmailGeneratorPort,
  IcpGeneratorPort,
  SequenceNamerPort,
} from "../../../core/ports/driven";

const MODEL = "claude-sonnet-5";

function client() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY manquant");
  return new Anthropic({ apiKey });
}

// Force the model to call a single tool and return its (schema-valid) input.
async function structured<T>(opts: {
  system: string;
  prompt: string;
  toolName: string;
  schema: Record<string, unknown>;
  maxTokens: number;
}): Promise<T> {
  let msg: Anthropic.Message;
  try {
    msg = await client().messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens,
      system: opts.system,
      tools: [
        {
          name: opts.toolName,
          description: "Return the result in this exact structure.",
          input_schema: opts.schema as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: opts.toolName },
      messages: [{ role: "user", content: opts.prompt }],
    });
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      throw new ProviderError("anthropic", e.status ?? 500, `Anthropic ${e.status ?? ""} — ${e.message}`, e.error);
    }
    throw new ProviderError("anthropic", 500, `Anthropic — ${e instanceof Error ? e.message : String(e)}`);
  }
  const block = msg.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use")
    throw new ProviderError("anthropic", 502, "Anthropic returned no structured output");
  return block.input as T;
}

export class AnthropicIcpGenerator implements IcpGeneratorPort {
  async fromWebsite({ url, siteText }: { url: string; siteText: string }): Promise<Persona> {
    const j = await structured<Partial<Persona>>({
      system: "You infer a B2B sales ICP (ideal customer profile) from a company website.",
      prompt: `Company site: ${url}\n\nExtracted text:\n${siteText.slice(0, 8000)}\n\nInfer who they should sell to.`,
      toolName: "set_icp",
      maxTokens: 1024,
      schema: {
        type: "object",
        properties: {
          jobTitle: { type: "array", items: { type: "string" } },
          excludeJobTitle: { type: "array", items: { type: "string" } },
          location: { type: "array", items: { type: "string" } },
          headcount: { type: "array", items: { type: "string", enum: [...HEADCOUNT] } },
          industry: { type: "array", items: { type: "string" } },
          seniority: { type: "array", items: { type: "string", enum: [...SENIORITY] } },
          additionalInfo: { type: "string" },
        },
        required: ["jobTitle", "industry", "seniority"],
      },
    });
    return {
      jobTitle: j.jobTitle ?? [],
      excludeJobTitle: j.excludeJobTitle ?? [],
      location: j.location ?? [],
      headcount: j.headcount ?? [],
      industry: j.industry ?? [],
      seniority: j.seniority ?? [],
      additionalInfo: j.additionalInfo ?? null,
    };
  }
}

export class AnthropicSequenceNamer implements SequenceNamerPort {
  async generate({ companies }: { companies: string[] }): Promise<string> {
    const msg = await client().messages.create({
      model: MODEL,
      max_tokens: 40,
      system:
        "You name sales prospecting sequences with a short, memorable two-word French codename (e.g. 'Horizon Cobalt', 'Marée Ambre'). Reply with ONLY the name, no quotes, no punctuation.",
      messages: [
        {
          role: "user",
          content: companies.length
            ? `Companies in this batch: ${companies.slice(0, 8).join(", ")}. Give the codename.`
            : "Give a random codename.",
        },
      ],
    });
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim()
      .replace(/^["']|["'.]+$/g, "")
      .split("\n")[0];
    return text || "Séquence";
  }
}

export class AnthropicEmailGenerator implements EmailGeneratorPort {
  async write(ctx: Parameters<EmailGeneratorPort["write"]>[0]) {
    const j = await structured<{ subject?: string; body?: string }>({
      system:
        "You are an expert SDR. Write honest, concise outbound emails that position the sender's product as the objective best choice versus competitors.",
      prompt: ctx.template.buildPrompt(ctx),
      toolName: "write_email",
      maxTokens: 700,
      schema: {
        type: "object",
        properties: { subject: { type: "string" }, body: { type: "string" } },
        required: ["subject", "body"],
      },
    });
    return { subject: String(j.subject ?? ""), body: String(j.body ?? "") };
  }
}
