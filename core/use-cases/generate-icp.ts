import type { Persona } from "../domain/entities";
import type { Ports } from "../ports/driven";

// Website -> ICP draft (Anthropic). Does NOT save; the user validates first.
export class GenerateIcp {
  constructor(private readonly ports: Pick<Ports, "icpGenerator">) {}

  execute(input: { url: string; siteText: string }): Promise<Persona> {
    return this.ports.icpGenerator.fromWebsite(input);
  }
}

// Persist the validated ICP into Sillage (PUT /v2/persona).
export class SavePersona {
  constructor(private readonly ports: Pick<Ports, "personaStore">) {}

  execute(persona: Persona): Promise<void> {
    return this.ports.personaStore.upsert(persona);
  }
}
