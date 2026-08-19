// Pitch Portal API: research → use cases → PPT + HTML downloads.
// POST /pitches starts a job. GET /pitches/:jobId is polled until files are ready.
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { research } from "./src/steps/1-research.js";
import { generateUseCases, selectTopUseCases } from "./src/steps/2-usecases.js";
import { buildDeck } from "./src/steps/3-deck.js";
import { buildMockup } from "./src/steps/4-mockup.js";
import { slugify } from "./src/lib/slugify.js";

dotenv.config();

const APP_ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = path.join(APP_ROOT, "output");
const JOBS_DIR = process.env.RENDER
  ? path.join(os.tmpdir(), "pitch-portal-jobs")
  : path.join(OUTPUT_DIR, "jobs");
const JOB_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const jobsById = new Map();

const app = express();
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    "https://ankitsujanti-ux.github.io",
  ];
  let fromRender = false;
  try {
    fromRender = Boolean(origin && /\.onrender\.com$/i.test(new URL(origin).hostname));
  } catch {
    fromRender = false;
  }
  if (origin && (allowed.includes(origin) || fromRender)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());

function packageDir(slug) {
  const safe = slugify(slug);
  const dir = path.resolve(OUTPUT_DIR, safe);
  if (!dir.startsWith(OUTPUT_DIR)) {
    throw new Error("Invalid download path");
  }
  return { safe, dir };
}

function jobPath(id) {
  if (!JOB_ID_RE.test(id)) {
    throw new Error("Invalid job id");
  }
  return path.join(JOBS_DIR, `${id}.json`);
}

function writeJob(job) {
  jobsById.set(job.id, job);
  fs.mkdirSync(JOBS_DIR, { recursive: true });
  fs.writeFileSync(jobPath(job.id), JSON.stringify(job, null, 2));
  return job;
}

function readJob(id) {
  const fromMemory = jobsById.get(id);
  if (fromMemory) return fromMemory;
  const file = jobPath(id);
  if (!fs.existsSync(file)) return null;
  const job = JSON.parse(fs.readFileSync(file, "utf8"));
  jobsById.set(id, job);
  return job;
}

function patchJob(id, patch) {
  const current = readJob(id);
  if (!current) return null;
  return writeJob({ ...current, ...patch, updatedAt: new Date().toISOString() });
}

function publicJob(job) {
  if (!job) return null;
  return {
    jobId: job.id,
    status: job.status,
    step: job.step || null,
    companyName: job.companyName,
    error: job.error || null,
    result: job.result || null,
  };
}

function pipelineErrorMessage(err) {
  const raw = err?.error?.message || err.message || "Pipeline failed";
  if (/server had an error processing your request/i.test(raw)) {
    return "Azure AI Foundry had a temporary issue. Click Generate again — the run usually succeeds on retry.";
  }
  return raw;
}

async function runPipeline(jobId, { companyName, domain, requirement }) {
  try {
    patchJob(jobId, { status: "running", step: "research" });
    console.log(`[${companyName}] Step 1/4 - researching with Azure AI Foundry...`);
    const researchOut = await research({ companyName, domain, requirement });
    const researchResult = researchOut.text;
    const researchStructured = researchOut.structured || null;

    patchJob(jobId, { step: "use-cases" });
    console.log(`[${companyName}] Step 2/4 - generating use cases...`);
    const useCases = await generateUseCases({
      companyName,
      domain,
      requirement,
      research: researchResult,
      numUseCases: 5,
      numMockupTabs: 5,
    });
    const topUseCases = selectTopUseCases(useCases);
    if (!topUseCases.length) {
      throw new Error("No use cases were selected for the mockup.");
    }

    patchJob(jobId, { step: "deck" });
    console.log(`[${companyName}] Step 3/4 - building pitch deck...`);
    const deckPath = await buildDeck({
      companyName,
      domain,
      requirement,
      research: researchResult,
      researchStructured,
      useCases,
    });

    const slug = slugify(companyName);
    const deckFileName = `${slug}-pitch-deck.pptx`;
    const htmlFileName = `${slug}-mockup.html`;

    patchJob(jobId, { step: "mockup" });
    console.log(`[${companyName}] Step 4/4 - building interactive mockup...`);
    const mockupHtml = await buildMockup({
      companyName,
      domain,
      topUseCases,
      deckFileName,
    });

    const dir = path.join(OUTPUT_DIR, slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(deckPath, path.join(dir, deckFileName));
    fs.writeFileSync(path.join(dir, htmlFileName), mockupHtml, "utf8");
    fs.writeFileSync(path.join(dir, "index.html"), mockupHtml, "utf8");

    patchJob(jobId, { step: "files" });
    console.log(`[${companyName}] Saving PPT and HTML for download...`);

    const researchSource = researchOut.source;
    const useCaseSource = useCases.source || "fallback";
    const contentSource =
      researchSource === "azure" && useCaseSource === "azure"
        ? "azure"
        : researchSource === "fallback" && useCaseSource === "fallback"
          ? "fallback"
          : "mixed";

    console.log(`[${companyName}] Files ready in ${dir} (content: ${contentSource})`);

    patchJob(jobId, {
      status: "done",
      step: "done",
      result: {
        message: "Pitch package ready to download.",
        slug,
        deckFileName,
        htmlFileName,
        deckDownloadUrl: `/downloads/${slug}/deck`,
        htmlDownloadUrl: `/downloads/${slug}/html`,
        htmlPreviewUrl: `/downloads/${slug}/preview`,
        contentSource,
        researchSummary: String(researchResult).slice(0, 600),
        useCaseSummary: useCases.useCases.map((uc) => ({
          title: uc.title,
          businessProblem: uc.businessProblem,
        })),
        featuredInMockup: useCases.topForMockup,
      },
    });
  } catch (err) {
    console.error(`[${companyName}] Pipeline failed:`, err);
    patchJob(jobId, {
      status: "error",
      error: pipelineErrorMessage(err),
    });
  }
}

app.get("/", (req, res) => {
  res.redirect(302, "https://ankitsujanti-ux.github.io/apexon-pitch-portal/");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Pitch portal backend is running",
    foundryAuth: process.env.AZURE_CLIENT_ID ? "service-principal" : "interactive-or-missing",
  });
});

app.get("/downloads/:slug/deck", (req, res) => {
  try {
    const { safe, dir } = packageDir(req.params.slug);
    const fileName = `${safe}-pitch-deck.pptx`;
    const filePath = path.join(dir, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Deck not found. Generate a package first." });
    }
    res.setHeader("Cache-Control", "no-store");
    res.download(filePath, fileName);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/downloads/:slug/html", (req, res) => {
  try {
    const { safe, dir } = packageDir(req.params.slug);
    const fileName = `${safe}-mockup.html`;
    const filePath = path.join(dir, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "HTML mockup not found. Generate a package first." });
    }
    res.setHeader("Cache-Control", "no-store");
    res.download(filePath, fileName);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/downloads/:slug/preview", (req, res) => {
  try {
    const { safe, dir } = packageDir(req.params.slug);
    const filePath = path.join(dir, `${safe}-mockup.html`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "HTML mockup not found. Generate a package first." });
    }
    res.type("html").send(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/pitches/:jobId", (req, res) => {
  try {
    const job = readJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }
    res.json(publicJob(job));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/pitches", (req, res) => {
  const companyName = String(req.body.companyName || "").trim();
  const domain = String(req.body.domain || "").trim();
  const requirement = String(req.body.requirement || "").trim();

  if (!companyName || !domain || !requirement) {
    return res.status(400).json({
      error: "companyName, domain, and requirement are all required",
    });
  }

  const jobId = crypto.randomUUID();
  writeJob({
    id: jobId,
    status: "queued",
    step: "queued",
    companyName,
    domain,
    requirement,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  setImmediate(() => {
    runPipeline(jobId, { companyName, domain, requirement });
  });

  res.status(200).json({ jobId, status: "queued" });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

const FIFTEEN_MINUTES = 15 * 60 * 1000;
server.timeout = FIFTEEN_MINUTES;
server.keepAliveTimeout = FIFTEEN_MINUTES;
server.headersTimeout = FIFTEEN_MINUTES + 1000;
