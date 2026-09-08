import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { generateDeck } from "@/inngest/functions/generate-deck";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateDeck],
});