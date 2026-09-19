import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "inngest-demo",
});

const getUser = inngest.createFunction(
  {
    id: "get-user",
    triggers: [
      {
        event: "user/get",
      },
    ],
  },
  async ({ event }) => {
    const { name, age } = event.data;

    return {
      name,
      age,
    };
  }
);

export const functions = [getUser];