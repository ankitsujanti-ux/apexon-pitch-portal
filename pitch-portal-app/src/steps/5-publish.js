// Pushes the pitch deck and HTML mockup to GitHub Pages.
// Live URL: https://{owner}.github.io/{repo}/{slug}/

import fs from "fs";
import path from "path";
import { slugify } from "../lib/slugify.js";

function loadEnvFile() {
  const envPath = path.resolve("./.env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function putFile({ token, owner, repo, filePath, contentBase64, message }) {
  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "pitch-portal-publisher",
  };

  let sha;
  const existing = await fetch(getUrl, { headers });
  if (existing.ok) {
    const body = await existing.json();
    sha = Array.isArray(body) ? undefined : body.sha;
  } else if (existing.status !== 404) {
    throw new Error(`GitHub GET ${filePath} failed: ${existing.status} ${await existing.text()}`);
  }

  const put = await fetch(getUrl, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: contentBase64,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!put.ok) {
    throw new Error(`GitHub PUT ${filePath} failed: ${put.status} ${await put.text()}`);
  }
}

export async function publish({ companyName, deckPath, mockupHtml }) {
  loadEnvFile();
  if (!companyName || !deckPath || !mockupHtml) {
    throw new Error("publish requires companyName, deckPath, and mockupHtml");
  }

  const slug = slugify(companyName);
  const token = process.env.GITHUB_TOKEN;
  const repoFull = process.env.GITHUB_REPO || "ankitsujanti-ux/apexon-pitch-portal";
  if (!token || /placeholder|your-github/i.test(token)) {
    throw new Error("GITHUB_TOKEN is missing. Set a real token with repo scope in .env");
  }

  const [owner, repo] = repoFull.split("/");
  const deckFileName = `${slug}-pitch-deck.pptx`;
  const htmlWithDeckLink = mockupHtml.includes('class="header-link"')
    ? mockupHtml
    : mockupHtml.replace(
        "</header>",
        `<a class="header-link" href="${deckFileName}">Download pitch deck</a></header>`
      );

  await putFile({
    token,
    owner,
    repo,
    filePath: `${slug}/index.html`,
    contentBase64: Buffer.from(htmlWithDeckLink, "utf8").toString("base64"),
    message: `Publish ${companyName} interactive mockup`,
  });

  const deckBytes = fs.readFileSync(deckPath);
  await putFile({
    token,
    owner,
    repo,
    filePath: `${slug}/${deckFileName}`,
    contentBase64: deckBytes.toString("base64"),
    message: `Publish ${companyName} pitch deck`,
  });

  const pagesUrl = `https://${owner}.github.io/${repo}/${slug}/`;
  return {
    url: pagesUrl,
    slug,
    deckFileName,
    pagesUrl,
    deckDownloadUrl: `https://github.com/${owner}/${repo}/raw/main/${slug}/${deckFileName}`,
  };
}
