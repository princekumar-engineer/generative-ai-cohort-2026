import {
    run,
    InputGuardrailTripwireTriggered,
    OutputGuardrailTripwireTriggered,
  } from "@openai/agents";

  import { pitchDeckAgent } from "@/lib/agents/pitch-deck-agent";
import { PitchDeckSchema, type PitchDeck } from "@/lib/schemas/pitch-deck";


export class PitchDeckGenerationError extends Error {
    readonly reason?: string;
  
    constructor(message: string, reason?: string) {
      super(message);
      this.name = "PitchDeckGenerationError";
      this.reason = reason;
    }
  }
  

  function isGuardrailError(error: unknown): boolean {
    return (
      error instanceof InputGuardrailTripwireTriggered ||
      error instanceof OutputGuardrailTripwireTriggered
    );
  }

  function getGuardrailReason(error: unknown): string {
    if (
      error instanceof InputGuardrailTripwireTriggered ||
      error instanceof OutputGuardrailTripwireTriggered
    ) {
      const info = error.result.output.outputInfo as { reason?: string } | undefined;
      return info?.reason ?? "Pitch deck generation was blocked by a guardrail.";
    }
  
    return "Pitch deck generation was blocked by a guardrail.";
  }

  function parseAgentOutput(rawOutput: unknown): PitchDeck {
    return PitchDeckSchema.parse(rawOutput);
  }


  export async function generatePitchDeck(idea:string):Promise<PitchDeck> {
    const trimmedIdea = idea.trim();

    try {
        const agentResult = await run(pitchDeckAgent , trimmedIdea);

        return parseAgentOutput(agentResult.finalOutput);
    } catch (error) {
         // Guardrail blocked us — throw a readable error
    if (isGuardrailError(error)) {
        const reason = getGuardrailReason(error);
        throw new PitchDeckGenerationError(reason, reason);
      }

      return error as unknown as PitchDeck;
    }
  
    
  }