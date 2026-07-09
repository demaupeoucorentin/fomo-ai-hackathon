export * from "./dto";
export * from "./providers";
export * from "./repositories";
export * from "./system";

import type {
  ContactEnricherPort,
  EmailGeneratorPort,
  IcpGeneratorPort,
  PersonaStorePort,
  SignalProviderPort,
} from "./providers";
import type {
  CompanyRepositoryPort,
  EmailRepositoryPort,
  InteractionRepositoryPort,
  LeadRepositoryPort,
  RunRepositoryPort,
  SignalRepositoryPort,
  StepLogRepositoryPort,
} from "./repositories";
import type { ClockPort, IdPort } from "./system";

// Everything the core needs, wired by the composition root.
export interface Ports {
  signalProvider: SignalProviderPort;
  personaStore: PersonaStorePort;
  icpGenerator: IcpGeneratorPort;
  contactEnricher: ContactEnricherPort;
  emailGenerator: EmailGeneratorPort;

  runs: RunRepositoryPort;
  companies: CompanyRepositoryPort;
  leads: LeadRepositoryPort;
  signals: SignalRepositoryPort;
  emails: EmailRepositoryPort;
  stepLogs: StepLogRepositoryPort;
  interactions: InteractionRepositoryPort;

  clock: ClockPort;
  id: IdPort;
}
