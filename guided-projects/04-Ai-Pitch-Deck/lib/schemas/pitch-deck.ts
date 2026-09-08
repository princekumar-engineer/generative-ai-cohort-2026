import { z } from "zod";

export const SlideSchema = z.object({
  title: z.string().min(3).max(80),
  content: z.string().min(20).max(500),
  imagePrompt: z.string().min(10).max(300),
});

export const PitchDeckSchema = z.object({
  deckTitle: z.string().min(3).max(100),
  slides: z.array(SlideSchema).min(5).max(8),
});

export type Slide = z.infer<typeof SlideSchema>;
export type PitchDeck = z.infer<typeof PitchDeckSchema>;
