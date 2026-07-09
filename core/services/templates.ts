// Email angle templates, keyed by the signal (agent) type that triggers them.
// Pure: buildPrompt returns the instruction string for the EmailGenerator port.
import type {
  AgentType,
  EmailTemplate,
  EmailTemplateContext,
} from "../domain/entities";
import { fullName } from "../domain/entities";

const who = (c: EmailTemplateContext) =>
  `${fullName(c.lead)} (${c.lead.position ?? "decision maker"}) at ${c.company.name}`;

const base = (c: EmailTemplateContext, angle: string) =>
  [
    `Write a short, sharp outbound sales email in the lead's language.`,
    `Recipient: ${who(c)}.`,
    c.persona?.additionalInfo ? `Our ICP context: ${c.persona.additionalInfo}.` : "",
    angle,
    `The email must feel human, be under 120 words, position our solution as the objective best choice versus competitors WITHOUT naming false facts, and end with one soft CTA.`,
    `Return plain text only.`,
  ]
    .filter(Boolean)
    .join("\n");

export const COMPETITOR_TEMPLATE: EmailTemplate = {
  key: "competitor_comparison",
  label: "Comparateur concurrent",
  agentTypes: ["competitor_activity", "content_engagement", "influencer_engagement"],
  buildPrompt: (c) =>
    base(
      c,
      `Angle: they just engaged with a competitor's content. Open with an objective, neutral comparison of the category and let our strengths stand out. Never trash the competitor.`,
    ),
};

export const GROWTH_TEMPLATE: EmailTemplate = {
  key: "growth_signal",
  label: "Signal de croissance",
  agentTypes: ["deep_search"],
  buildPrompt: (c) =>
    base(
      c,
      `Angle: a company-level growth signal was detected (funding, hiring wave, expansion). Tie our value to scaling fast without adding overhead.`,
    ),
};

export const NEW_ROLE_TEMPLATE: EmailTemplate = {
  key: "new_role",
  label: "Nouveau poste",
  agentTypes: ["job_update", "champion_tracking"],
  buildPrompt: (c) =>
    base(
      c,
      `Angle: the lead just changed job or was promoted. Congratulate briefly, then frame us as the easy win for their first 90 days.`,
    ),
};

export const HIRING_TEMPLATE: EmailTemplate = {
  key: "hiring",
  label: "Recrutement",
  agentTypes: ["job_posting", "keyword_detection"],
  buildPrompt: (c) =>
    base(
      c,
      `Angle: their team is hiring / posted relevant roles. Connect the hiring pain to how we reduce the workload the new hires would face.`,
    ),
};

export const FOLLOW_UP_TEMPLATE: EmailTemplate = {
  key: "follow_up",
  label: "Relance",
  agentTypes: [],
  buildPrompt: (c) =>
    base(
      c,
      `Angle: gentle follow-up to a first email. Add one new concrete proof point or comparison and keep it lighter than the first.`,
    ),
};

export const BREAKUP_TEMPLATE: EmailTemplate = {
  key: "breakup",
  label: "Dernière relance",
  agentTypes: [],
  buildPrompt: (c) =>
    base(
      c,
      `Angle: final break-up email. Low pressure, leave the door open, one line reminding why we beat the alternatives.`,
    ),
};

// Angle templates matched to signals (order = priority for ties).
export const ANGLE_TEMPLATES: EmailTemplate[] = [
  COMPETITOR_TEMPLATE,
  GROWTH_TEMPLATE,
  NEW_ROLE_TEMPLATE,
  HIRING_TEMPLATE,
];

export const DEFAULT_TEMPLATE = COMPETITOR_TEMPLATE;

// Pick the content angle for a given triggering signal type.
export const pickTemplate = (agentType: AgentType | null): EmailTemplate => {
  if (!agentType) return DEFAULT_TEMPLATE;
  return (
    ANGLE_TEMPLATES.find((t) => t.agentTypes.includes(agentType)) ??
    DEFAULT_TEMPLATE
  );
};
