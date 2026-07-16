import { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: '',
});

const SYSTEM_PROMPT = `
  You are an expert AI engineer. You have to analyse the user's input carefully and then you need to
  breakdown the problem into multiple sub problems before comming on to the final result. Always breakdown
  the users intention and how to solve that problem and then step by step solve it.

  We are going to follow a pipeline of "INITAL", "THINK", "ANALYSE" and "OUTPUT" pipline.

  The Pipeline:
  - "INITAL" When user gives an input, we will have an inital thought process on what this user is trying to do.
  - "THINK" this is where we are going to think about how to solve this and then start to breakdown the problem
  - "ANALYSE" this is where we will analyse the solution and also verify if the output is correct
  - "THINK" we can go back to think mode where we now see if any sub problem remanins and think
  - "ANALYSE" again analyse the problem and get onto a solution
  - "OUTPUT" this is where we can end and give the final output to the user.

  Rules:
  - Always output one step at a time and wait for other step before proceeding.
  - Always maintain the sequence of pipeline as given in example
  - Always follow JSON output format strictly.

  Example:
  - "USER": What is 2 + 2 - 5 * 10 / 3?
  OUTPUT:
  - "INITAL": "The user wants me to solve a maths equation"
  - "THINK": "I will use the BODMAS formula and based on that I should firt multiple 5 * 10 which is 50"
  - "ANALYSE": "Yes, the bodmas is actaully right and now equation is 2 + 2 - 50 / 3"
  - "THINK": "Now as per rule I should perform divide which is dividing 50 / 3 which is 16.666667"
  - "ANALYSE": "Now the new equations remains 2 + 2 - 16.666667"
  - "THINK": "Now its simple we can just do 2 + 2 = 4 and new equation remains 4 - 16.6666667"
  - "ANALYSE": "Great, now lets just do the final step as simple subtraction"
  - "THINK": "After the final subtraction the ans remations -12.666667"
  - "OUTPUT": "The final output is "-12.666667"

  Output Format:
  { "step": "INITAL" | "THINK" | "ANALYSE" | "OUTPUT", "text": "<The Actual Text>" }

`;

const MESSAGES_DB = [{ role: 'system', content: SYSTEM_PROMPT }];

async function main(prompt = '') {
  MESSAGES_DB.push({ role: 'user', content: prompt });

  while (true) {
    const result = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: MESSAGES_DB,
    });

    const rawResult = result.choices[0].message.content;
    const parsedResult = JSON.parse(rawResult);

    MESSAGES_DB.push({ role: 'assistant', content: rawResult });

    console.log(`🤖 (${parsedResult.step}): ${parsedResult.text}`);

    if (parsedResult.step.toLowerCase() === 'output') break;
  }
}

main('What is weather of Patiala?');