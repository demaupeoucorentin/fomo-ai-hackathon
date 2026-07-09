import { container } from "@/adapters/composition/container";

async function scrapeSite(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 SillageGTM" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
  } catch {
    return "";
  }
}

function normalizeUrl(input: string): string {
  const s = input.trim();
  return /^https?:\/\//.test(s) ? s : `https://${s}`;
}

// POST { website } -> generate ICP draft (not saved).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { website?: string };
  if (!body.website) return Response.json({ error: "website required" }, { status: 400 });
  const url = normalizeUrl(body.website);
  const siteText = await scrapeSite(url);
  const persona = await container.generateIcp.execute({ url, siteText });
  return Response.json({ persona });
}

// PUT persona -> validate + save to Sillage.
export async function PUT(req: Request) {
  const persona = await req.json();
  await container.savePersona.execute(persona);
  return Response.json({ ok: true });
}
