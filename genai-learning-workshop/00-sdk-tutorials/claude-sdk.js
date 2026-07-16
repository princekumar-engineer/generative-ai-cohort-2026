import 'dotenv/config';
import { Anthropic } from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: 'Explain JavaScript promises.',
        },
      ],
    });

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(block.text);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

main();