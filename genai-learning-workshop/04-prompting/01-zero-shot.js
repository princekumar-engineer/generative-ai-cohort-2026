import { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: '',
});

async function main() {
  const result = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: 'tell me a story about little red ridding hood',
      },
    ],
  });
  console.log(`Ans from OpenAI API:`, result.choices[0].message.content);
}

main();