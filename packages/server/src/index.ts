import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import "dotenv/config";
import fs from "fs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import path from "path";
import { fileURLToPath } from "url";
import { getAllTasks, registerTask } from "./tasks/taskManager.js";
import { startWorker, stopWorker } from "./tasks/worker.js";

if (!process.env.PASSWORD) {
  throw new Error("PASSWORD is not set in environment variables");
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticRoot = path.join(__dirname, "..", "..", "server", "src"); // 如果 static 就在 packages/server/static

const app = new Hono();

app.use(logger());
app.use(cors());
// app.use("/tasks", bearerAuth({ token: process.env.PASSWORD as any }));
// app.use("/tasks/*", bearerAuth({ token: process.env.PASSWORD as any }));

app.use("/static/*", serveStatic({ root: staticRoot }));

app.post("/tasks", async (c) => {
  const body = await c.req.json();
  const url = String(body?.url ?? "").trim();
  const type = body?.type === "audio" ? "audio" : "video";
  if (!url) return c.json({ error: "url required" }, 400);
  const task = await registerTask(url, type);
  return c.json(task);
});

app.get("/tasks", (c) => c.json(getAllTasks()));
app.get("/tasks/success/log", (c) => {
  const dir = path.resolve(process.cwd(), "download");
  const file = "success.log";
  const p = path.join(dir, file);
  // 检查文件存在与否
  if (!fs.existsSync(p)) {
    return c.text("");
  }
  const text = fs.readFileSync(p, "utf-8");
  return c.text(text);
});
app.get("/tasks/failure/log", (c) => {
  const dir = path.resolve(process.cwd(), "download");
  const file = "failure.log";
  const p = path.join(dir, file);
  if (!fs.existsSync(p)) {
    return c.text("");
  }
  const text = fs.readFileSync(p, "utf-8");
  return c.text(text);
});

app.get("/", (c) => c.redirect("/static/index.html"));

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
