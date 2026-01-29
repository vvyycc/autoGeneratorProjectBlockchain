import express from "express";
import { sharedGreeting, statusSchema } from "@sale-factory/shared";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json());

app.get("/health", (_req, res) => {
  const response = statusSchema.parse({
    status: "ok",
    message: sharedGreeting("API")
  });

  res.json(response);
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
