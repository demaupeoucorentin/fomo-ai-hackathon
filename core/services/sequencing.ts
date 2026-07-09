// Builds the email sequence (retro-planning) for a lead: which templates, at
// which cadence, on which dates. Pure and deterministic.
import type {
  AgentType,
  ScheduledStep,
  SequenceStep,
} from "../domain/entities";
import { cadenceToDate } from "../domain/value-objects";
import { FOLLOW_UP_TEMPLATE, BREAKUP_TEMPLATE, pickTemplate } from "./templates";

// 3 touches: angle-matched opener (J+0), follow-up (J+7), break-up (J+14).
export const buildSequence = (topAgentType: AgentType | null): SequenceStep[] => [
  { template: pickTemplate(topAgentType), cadenceDays: 0 },
  { template: FOLLOW_UP_TEMPLATE, cadenceDays: 7 },
  { template: BREAKUP_TEMPLATE, cadenceDays: 14 },
];

export const buildSchedule = (
  steps: SequenceStep[],
  from: Date,
): ScheduledStep[] =>
  steps.map((s) => ({
    template: s.template,
    sendDate: cadenceToDate(from, s.cadenceDays),
  }));
