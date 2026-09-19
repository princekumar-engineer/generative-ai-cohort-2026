import express from "express";
import { serve } from "inngest/express";

import { inngest, functions } from "./inngest/index.js";

const app = express();

app.use(express.json());

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  })
);

app.get("/api/hello", async (req, res, next) => {
  try {
    await inngest.send({
      name: "user/get",
      data: {
        name: "Prince",
        age: 22,
      },
    });

    res.json({
      message: "Event sent!",
    });
  } catch (error) {
    next(error);
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});