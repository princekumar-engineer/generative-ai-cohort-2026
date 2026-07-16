import 'dotenv/config';

import OpenAI from 'openai';

const client = new OpenAI();

async function init() {
  try {
    const stream = await client.responses.create({
      model: 'gpt-5.5',
      input: [
        {
          role: 'user',
          content: 'Tell me the story and summary of Little Red Riding Hood.',
        },
      ],
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        process.stdout.write(event.delta);
      }
    }

    console.log(); // Move to the next line after streaming finishes
  } catch (error) {
    console.error('Error:', error);
  }
}

init();