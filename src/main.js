import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

import { createExitSignal, staticServer } from "./shared/server.ts";

import { getMusicAnalysis } from "./scripts/sections.js";

// import { saveMusic } from "./scripts/save-music.js";

const app = new Application();
const router = new Router();

router.post("/api/music", async (ctx) => {
  console.log("ctx.request.url.pathname:", ctx.request.url.pathname);

  console.log("ctx.request.method:", ctx.request.method);
  const JSONdata = await ctx.request.body({ limit: "20mb" }).value;
  const data = JSON.parse(JSONdata);
  console.log("data:", data);

  const analysis = await getMusicAnalysis(
    data.artist,
    data.title,
    data.duration
  );
  console.log("analysis:", analysis);
  ctx.response.body = JSON.stringify(analysis, null, 2);
  // await saveMusic(analysis);

  console.log("Done!");
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(staticServer);

const PORT = 3000;

console.log(`\nListening on http://localhost:${PORT}`);

await app.listen({ port: PORT, signal: createExitSignal() });
