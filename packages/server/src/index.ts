import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getAllTasks, getTask, registerTask } from "./tasks/taskManager.js";
import { startWorker, stopWorker } from "./tasks/worker.js";


if(!process.env.PASSWORD){
  throw new Error("PASSWORD is not set in environment variables");
}


const app = new Hono();

app.use(logger());
app.use(cors());
app.use("/*", bearerAuth({ token: process.env.PASSWORD as any }));

app.post("/tasks", async (c) => {
  const body = await c.req.json();
  const url = String(body?.url ?? "").trim();
  const type = body?.type === "audio" ? "audio" : "video";
  if (!url) return c.json({ error: "url required" }, 400);
  const task = await registerTask(url, type);
  return c.json(task);
});

app.get("/tasks", (c) => c.json(getAllTasks()));

app.get("/tasks/:id", (c) => {
  const id = c.req.param("id");
  const t = getTask(id);
  if (!t) return c.json({ error: "not found" }, 404);
  return c.json(t);
});

app.get("/", (c) => c.text("yt-dlp simple server"));

const port = Number(process.env.PORT || 8787);

const server = serve({
  fetch: app.fetch,
  port,
});

console.log(`🚀 Server is running at http://localhost:${port}`);

// start task worker
startWorker(2);

// graceful shutdown
process.on("SIGINT", () => {
  // stop worker first, then close server and exit
  try {
    stopWorker();
  } catch (e) {
    console.log(e);
  }
  server.close((err) => {
    process.exit(err ? 1 : 0);
  });
});
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    // stop worker gracefully
    stopWorker();
    process.exit(0);
  });
});
