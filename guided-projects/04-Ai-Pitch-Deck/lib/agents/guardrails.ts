import { Agent, run, type InputGuardrail, type OutputGuardrail } from "@openai/agents";
import { z } from "zod";

function getInputText(input: string | unknown[]): string {
    if (typeof input === "string") {
      return input;
    }
    return JSON.stringify(input);
  }

export const validProjectIdeaGuardrail: InputGuardrail = {
    name: "valid_project_idea",
    execute: async ({ input }) => {
      const text = getInputText(input).trim();
      const tooShort = text.length < 20;
  
      return {
        tripwireTriggered: tooShort,
        outputInfo: tooShort
          ? { reason: "Project idea must be at least 20 characters." }
          : undefined,
      };
    },
  };

  const QualityCheckSchema = z.object({
    isValid: z.boolean(),
    reason: z.string().optional(),
  });
  
  const qualityCheckerAgent = new Agent({
    name: "PitchDeckQualityChecker",
    model: "gpt-4.1-mini",
    instructions: `You review pitch deck JSON for a beginner learning app.
  
  Return isValid: false if ANY of these are true:
  - Profanity, hate speech, or violent content
  - Placeholder text like "TBD", "lorem ipsum", "[insert here]", "coming soon"
  - Slides with empty or meaningless filler content
  - Content that is clearly not a business pitch deck
  
  Otherwise return isValid: true.
  If invalid, explain why in the reason field.`,
    outputType: QualityCheckSchema as any,
  });

  export const pitchDeckQualityGuardrail: OutputGuardrail = {
    name: "pitch_deck_quality",
    execute: async ({ agentOutput }) => {
      const deckJson = JSON.stringify(agentOutput, null, 2);
      const checkResult = await run(qualityCheckerAgent, deckJson);
      const check = QualityCheckSchema.parse(checkResult.finalOutput as unknown);
  
      const isValid = check.isValid;
  
      return {
        tripwireTriggered: !isValid,
        outputInfo: isValid ? undefined : { reason: check.reason ?? "Deck failed quality checks." },
      };
    },
  };