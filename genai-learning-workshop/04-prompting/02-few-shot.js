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
        content: `
        what is 2 + 5 equals?
        Do not add anything else in ans, take the samples from the examples.
        Examples:
        - what is 5 + 4?
          Expected Output: 9 (Nine)
        - What is 10 + 10?
          Expected Output: 20 (Twenty)
        `,
      },
    ],
  });
  console.log(`Ans from OpenAI API:`, result.choices[0].message.content);
}

main();