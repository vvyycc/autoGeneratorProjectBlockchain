import express from "express";
import cors from "cors";

import projectsRouter from "./routes/projects";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use("/", projectsRouter);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
