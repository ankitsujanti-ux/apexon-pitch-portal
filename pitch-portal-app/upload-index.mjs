import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(root, ".env");
const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
}
const token = env.GITHUB_TOKEN;
const [owner, repo] = (env.GITHUB_REPO || "ankitsujanti-ux/apexon-pitch-portal").split("/");
const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "pitch-portal-job-fix",
};
const remotePath = "pitch-portal-app/index.js";
const url = `https://api.github.com/repos/${owner}/${repo}/contents/${remotePath}`;
const existing = await fetch(url, { headers });
let sha;
if (existing.ok) sha = (await existing.json()).sha;
else if (existing.status !== 404) throw new Error(await existing.text());
const put = await fetch(url, {
  method: "PUT",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Fix job lookup so Generate polling does not return Job not found",
    content: fs.readFileSync(path.join(root, "index.js")).toString("base64"),
    ...(sha ? { sha } : {}),
  }),
});
if (!put.ok) throw new Error(`PUT ${put.status} ${await put.text()}`);
console.log("Uploaded pitch-portal-app/index.js");
