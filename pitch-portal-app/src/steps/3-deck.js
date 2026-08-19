// 7-slide leadership deck on the Apexon Harness visual system.
// Slides: 5 use cases, proposed architecture (logos, not a screenshot), overall benefit.

import fs from "fs";
import path from "path";
import pptxgen from "pptxgenjs";
import { getPalette } from "../lib/palette.js";
import { slugify } from "../lib/slugify.js";
import { LOGO_PATH } from "../lib/templateTheme.js";
import { logoKeyForSystem, logoPath } from "../lib/logos.js";

const SLIDE_W = 13.33;
const SLIDE_H = 7.5;
const MARGIN = 0.42;

function pptSafe(text) {
  return String(text || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text, maxChars) {
  const clean = pptSafe(text);
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars).replace(/\s+\S*$/, "") + "...";
}

function applyMaster(slide, palette, { page, total }) {
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: SLIDE_H,
    fill: { color: palette.dark },
  });
  slide.addShape("rect", {
    x: 0,
    y: 7.18,
    w: SLIDE_W,
    h: 0.32,
    fill: { color: palette.primary },
  });
  slide.addShape("rect", {
    x: 0,
    y: 7.16,
    w: SLIDE_W,
    h: 0.035,
    fill: { color: palette.accent },
  });
  slide.addText("Confidential  |  Apexon", {
    x: MARGIN,
    y: 7.2,
    w: 6,
    h: 0.24,
    fontSize: 10,
    color: "9AA6B8",
    fontFace: palette.fontBody,
  });
  slide.addText(String(page).padStart(2, "0"), {
    x: 10.4,
    y: 7.2,
    w: 0.7,
    h: 0.24,
    fontSize: 10,
    color: "9AA6B8",
    fontFace: palette.fontBody,
    align: "right",
  });
  if (fs.existsSync(LOGO_PATH)) {
    slide.addImage({ path: LOGO_PATH, x: 11.35, y: 7.2, w: 1.5, h: 0.22 });
  } else {
    slide.addText("APEXON", {
      x: 11.2,
      y: 7.2,
      w: 1.7,
      h: 0.24,
      fontSize: 10,
      bold: true,
      color: palette.textLight,
      fontFace: palette.fontTitle,
      align: "right",
    });
  }
}

function addPanel(slide, palette, { x, y, w, h, kicker, title, body, accent }) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: palette.card },
    line: { color: accent || palette.cardBorder, width: 1 },
  });
  let cursorY = y + 0.12;
  if (kicker) {
    slide.addText(pptSafe(kicker).toUpperCase(), {
      x: x + 0.16,
      y: cursorY,
      w: w - 0.32,
      h: 0.2,
      fontSize: 10,
      bold: true,
      color: accent || palette.accent,
      fontFace: palette.fontTitle,
    });
    cursorY += 0.22;
  }
  if (title) {
    slide.addText(pptSafe(title), {
      x: x + 0.16,
      y: cursorY,
      w: w - 0.32,
      h: 0.26,
      fontSize: 13,
      bold: true,
      color: palette.heading,
      fontFace: palette.fontTitle,
    });
    cursorY += 0.28;
  }
  slide.addText(truncate(body, 520) || " ", {
    x: x + 0.16,
    y: cursorY,
    w: w - 0.32,
    h: h - (cursorY - y) - 0.1,
    fontSize: 12,
    color: palette.textLight,
    fontFace: palette.fontBody,
    valign: "top",
    wrap: true,
  });
}

function difficultyLabel(uc) {
  if (uc.difficulty === "easier") return "Easier — data this industry already holds";
  if (uc.difficulty === "harder") return "Harder — new source or unconfirmed join";
  return "Moderate — mix of existing and new work";
}

function dataBody(uc) {
  const desc =
    typeof uc.dataPointer === "string"
      ? uc.dataPointer
      : uc.dataPointer?.description || "Operational data typical for this industry";
  const conf = uc.dataPointer?.confidence === "confirmed" ? "Confirmed at this company." : "Industry-typical unless confirmed.";
  const avail = uc.dataPointer?.availability === "new" ? "New source or integration." : "Likely already exists.";
  return `${desc} ${avail} ${conf} ${uc.difficultyWhy || ""}`.trim();
}

function sourceTiles(research, researchStructured) {
  const fromJson = researchStructured?.systems?.map((s) => s.name).filter(Boolean) || [];
  const named = fromJson.slice(0, 8);
  if (named.length >= 4) return named;
  const defaults = ["ERP", "CRM", "Files / APIs", "Reporting marts", "Quality / ops systems", "Warehouse", "Other RDBMS", "Event feeds"];
  return [...named, ...defaults].slice(0, 8);
}

function addArchitectureSlide(slide, palette, { companyName, requirement, research, researchStructured, useCases }) {
  slide.addText("Proposed architecture", {
    x: MARGIN,
    y: 0.16,
    w: 9,
    h: 0.32,
    fontSize: 20,
    bold: true,
    color: palette.textLight,
    fontFace: palette.fontTitle,
  });
  slide.addText(truncate(`Harness-governed path for ${companyName}. Sources below are labeled confirmed only when research said so.`, 140), {
    x: MARGIN,
    y: 0.48,
    w: 12.4,
    h: 0.28,
    fontSize: 12,
    color: "B8C3D4",
    fontFace: palette.fontBody,
  });

  const sources = sourceTiles(research, researchStructured);

  slide.addShape("roundRect", {
    x: 0.28,
    y: 0.86,
    w: 2.55,
    h: 4.55,
    rectRadius: 0.08,
    fill: { color: palette.card },
    line: { color: "75A2ED", width: 1.25 },
  });
  slide.addText("SOURCE SYSTEMS", {
    x: 0.4,
    y: 0.96,
    w: 2.3,
    h: 0.24,
    fontSize: 10,
    bold: true,
    color: "75A2ED",
    fontFace: palette.fontTitle,
    align: "center",
  });
  sources.forEach((name, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.42 + col * 1.18;
    const y = 1.3 + row * 0.95;
    slide.addShape("roundRect", {
      x,
      y,
      w: 1.1,
      h: 0.86,
      rectRadius: 0.06,
      fill: { color: "0B1220" },
      line: { color: "243556", width: 1 },
    });
    const key = logoKeyForSystem(name);
    const img = logoPath(key);
    if (img) {
      slide.addImage({ path: img, x: x + 0.28, y: y + 0.08, w: 0.54, h: 0.42 });
    }
    slide.addText(truncate(name, 22), {
      x: x + 0.04,
      y: y + 0.52,
      w: 1.02,
      h: 0.3,
      fontSize: 9,
      color: palette.textLight,
      fontFace: palette.fontBody,
      align: "center",
      wrap: true,
    });
  });

  const bands = [
    { title: "1. DISCOVER & ASSESS", color: "1D6EE4", steps: ["Connect sources", "Validate access (L1)", "Catalog metadata", "Assessment agent", "Validator (L2)", "SME approval (L4)"] },
    { title: "2. PLAN & APPROVE", color: "0E7C66", steps: ["Use-case planner", "Plan validator (L3)", "Architecture approval (L4)"] },
    { title: "3. GENERATE DELIVERABLES", color: "E54A24", steps: ["Artifact generator — pipelines, models, docs, Fabric assets"] },
  ];
  bands.forEach((band, bi) => {
    const y = 0.86 + bi * 1.52;
    slide.addShape("roundRect", {
      x: 3.0,
      y,
      w: 7.05,
      h: 1.42,
      rectRadius: 0.08,
      fill: { color: palette.card },
      line: { color: band.color, width: 1.25 },
    });
    slide.addShape("rect", {
      x: 3.0,
      y,
      w: 0.1,
      h: 1.42,
      fill: { color: band.color },
    });
    slide.addText(band.title, {
      x: 3.22,
      y: y + 0.08,
      w: 6.7,
      h: 0.24,
      fontSize: 11,
      bold: true,
      color: band.color,
      fontFace: palette.fontTitle,
    });
    const stepW = (6.7 - (band.steps.length - 1) * 0.08) / band.steps.length;
    band.steps.forEach((step, si) => {
      const sx = 3.22 + si * (stepW + 0.08);
      slide.addShape("roundRect", {
        x: sx,
        y: y + 0.38,
        w: stepW,
        h: 0.9,
        rectRadius: 0.06,
        fill: { color: "0B1220" },
        line: { color: "243556", width: 1 },
      });
      slide.addText(`${si + 1 + (bi === 1 ? 6 : bi === 2 ? 9 : 0)}`, {
        x: sx + 0.06,
        y: y + 0.42,
        w: 0.28,
        h: 0.22,
        fontSize: 10,
        bold: true,
        color: band.color,
        fontFace: palette.fontTitle,
      });
      slide.addText(step, {
        x: sx + 0.08,
        y: y + 0.64,
        w: stepW - 0.16,
        h: 0.56,
        fontSize: 10,
        color: palette.textLight,
        fontFace: palette.fontBody,
        wrap: true,
      });
    });
  });

  slide.addShape("roundRect", {
    x: 10.2,
    y: 0.86,
    w: 2.75,
    h: 4.55,
    rectRadius: 0.08,
    fill: { color: palette.card },
    line: { color: "A78BFA", width: 1.25 },
  });
  slide.addText("TARGET PLATFORM", {
    x: 10.32,
    y: 0.96,
    w: 2.5,
    h: 0.22,
    fontSize: 10,
    bold: true,
    color: "C4B5FD",
    fontFace: palette.fontTitle,
    align: "center",
  });
  const fabric = logoPath("fabric");
  if (fabric) {
    slide.addImage({ path: fabric, x: 11.05, y: 1.28, w: 1.05, h: 0.95 });
  }
  slide.addText("Microsoft Fabric", {
    x: 10.32,
    y: 2.28,
    w: 2.5,
    h: 0.24,
    fontSize: 13,
    bold: true,
    color: palette.textLight,
    fontFace: palette.fontTitle,
    align: "center",
  });
  slide.addText("Extensible to other targets", {
    x: 10.32,
    y: 2.52,
    w: 2.5,
    h: 0.2,
    fontSize: 10,
    color: "9AA6B8",
    fontFace: palette.fontBody,
    align: "center",
  });
  const targets = [
    { key: "lakehouse", label: "Lakehouse" },
    { key: "semantic", label: "Warehouse" },
    { key: "pipelines", label: "Pipelines" },
    { key: "ai", label: "Semantic + AI" },
  ];
  targets.forEach((t, i) => {
    const y = 2.86 + i * 0.6;
    const img = logoPath(t.key);
    if (img) slide.addImage({ path: img, x: 10.45, y: y, w: 0.42, h: 0.42 });
    slide.addText(t.label, {
      x: 10.95,
      y: y + 0.08,
      w: 1.8,
      h: 0.28,
      fontSize: 12,
      color: palette.textLight,
      fontFace: palette.fontBody,
    });
  });

  slide.addText("HARNESS GOVERNANCE LAYERS", {
    x: MARGIN,
    y: 5.5,
    w: 6,
    h: 0.22,
    fontSize: 10,
    bold: true,
    color: "9AA6B8",
    fontFace: palette.fontTitle,
  });
  const layers = [
    { n: "L1", title: "Constraint", body: "Trusted inputs only", color: "0E7C66" },
    { n: "L2", title: "AI validation", body: "Check generated output", color: "1D6EE4" },
    { n: "L3", title: "Plan check", body: "Check the migration plan", color: "6366F1" },
    { n: "L4", title: "Quality gate", body: "Ready to run and audit", color: "E54A24" },
  ];
  layers.forEach((layer, i) => {
    const x = 0.28 + i * 3.22;
    slide.addShape("roundRect", {
      x,
      y: 5.76,
      w: 3.08,
      h: 1.28,
      rectRadius: 0.08,
      fill: { color: palette.card },
      line: { color: layer.color, width: 1.25 },
    });
    slide.addText(layer.n, {
      x: x + 0.14,
      y: 5.86,
      w: 0.5,
      h: 0.24,
      fontSize: 12,
      bold: true,
      color: layer.color,
      fontFace: palette.fontTitle,
    });
    slide.addText(layer.title, {
      x: x + 0.64,
      y: 5.86,
      w: 2.25,
      h: 0.24,
      fontSize: 13,
      bold: true,
      color: palette.textLight,
      fontFace: palette.fontTitle,
    });
    slide.addText(layer.body, {
      x: x + 0.14,
      y: 6.18,
      w: 2.8,
      h: 0.7,
      fontSize: 12,
      color: "B8C3D4",
      fontFace: palette.fontBody,
      wrap: true,
    });
  });
}

function addUseCaseSlide(slide, palette, uc, index, total, companyName) {
  slide.addText(`USE CASE  ${String(index + 1).padStart(2, "0")}  /  ${String(total).padStart(2, "0")}`, {
    x: MARGIN,
    y: 0.16,
    w: 4.5,
    h: 0.22,
    fontSize: 11,
    bold: true,
    color: palette.accent,
    fontFace: palette.fontTitle,
  });
  slide.addText(truncate(uc.title, 72), {
    x: MARGIN,
    y: 0.38,
    w: 12.4,
    h: 0.42,
    fontSize: 22,
    bold: true,
    color: palette.textLight,
    fontFace: palette.fontTitle,
    wrap: true,
  });
  slide.addText(truncate(companyName, 40), {
    x: 9.4,
    y: 0.16,
    w: 3.5,
    h: 0.22,
    fontSize: 11,
    color: "9AA6B8",
    fontFace: palette.fontBody,
    align: "right",
  });

  addPanel(slide, palette, {
    x: MARGIN,
    y: 0.9,
    w: 6.05,
    h: 2.35,
    kicker: "The use case",
    title: "What we would stand up",
    body: uc.businessProblem,
  });
  addPanel(slide, palette, {
    x: 6.7,
    y: 0.9,
    w: 6.2,
    h: 2.35,
    kicker: "Why it matters",
    title: "How leadership benefits",
    body: uc.benefit || uc.solutionFit,
    accent: "0E7C66",
  });

  const kpis = (uc.kpis || []).slice(0, 4);
  const kpiW = kpis.length ? (12.48 - (kpis.length - 1) * 0.14) / kpis.length : 3;
  kpis.forEach((kpi, i) => {
    addPanel(slide, palette, {
      x: MARGIN + i * (kpiW + 0.14),
      y: 3.38,
      w: kpiW,
      h: 1.55,
      kicker: "KPI",
      title: truncate(kpi.name, 28),
      body: kpi.why,
    });
  });

  addPanel(slide, palette, {
    x: MARGIN,
    y: 5.06,
    w: 8.15,
    h: 1.95,
    kicker: "Data required",
    title: difficultyLabel(uc),
    body: dataBody(uc),
  });
  addPanel(slide, palette, {
    x: 8.78,
    y: 5.06,
    w: 4.12,
    h: 1.95,
    kicker: "On the platform",
    title: "How we would land it",
    body: Array.isArray(uc.techComponents) ? uc.techComponents.join("  |  ") : uc.solutionFit,
    accent: palette.accent,
  });
}

function addBenefitsSlide(slide, palette, { companyName, useCases, overallBenefits, requirement }) {
  slide.addText("Overall benefit", {
    x: MARGIN,
    y: 0.2,
    w: 12.4,
    h: 0.4,
    fontSize: 24,
    bold: true,
    color: palette.textLight,
    fontFace: palette.fontTitle,
  });
  slide.addText(truncate(`What ${companyName} leadership gets if the five use cases run as one program.`, 140), {
    x: MARGIN,
    y: 0.62,
    w: 12.4,
    h: 0.3,
    fontSize: 13,
    color: "B8C3D4",
    fontFace: palette.fontBody,
  });

  const benefits =
    Array.isArray(overallBenefits) && overallBenefits.length
      ? overallBenefits.slice(0, 6)
      : useCases.map((uc) => uc.benefit || uc.title);
  benefits.slice(0, 6).forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    addPanel(slide, palette, {
      x: MARGIN + col * 4.2,
      y: 1.05 + row * 2.35,
      w: 4.05,
      h: 2.2,
      kicker: `0${i + 1}`,
      title: i < useCases.length ? truncate(useCases[i]?.title, 36) : "Program outcome",
      body: item,
    });
  });

  slide.addText(truncate(requirement, 180), {
    x: MARGIN,
    y: 5.85,
    w: 12.4,
    h: 1.15,
    fontSize: 14,
    color: palette.heading,
    fontFace: palette.fontBody,
    wrap: true,
  });
}

export async function buildDeck({
  companyName,
  domain,
  requirement,
  research,
  researchStructured,
  useCases,
  outputPath,
}) {
  if (!companyName || !domain || !useCases || !Array.isArray(useCases.useCases)) {
    throw new Error(
      "buildDeck requires companyName, domain, and a useCases object with a useCases array"
    );
  }

  const palette = getPalette(domain, companyName);
  const slug = slugify(companyName);
  const finalPath = outputPath || path.join("./output", `${slug}-pitch-deck.pptx`);
  fs.mkdirSync(path.dirname(finalPath), { recursive: true });

  const list = useCases.useCases.slice(0, 5);
  const total = 7;
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Apexon";
  pres.title = `${pptSafe(companyName)} — ${pptSafe(domain)} solutioning`;
  pres.subject = "Apexon Harness-governed Microsoft Fabric pitch";

  list.forEach((uc, i) => {
    const slide = pres.addSlide();
    applyMaster(slide, palette, { page: i + 1, total });
    addUseCaseSlide(slide, palette, uc, i, list.length, companyName);
  });

  {
    const slide = pres.addSlide();
    applyMaster(slide, palette, { page: 6, total });
    addArchitectureSlide(slide, palette, {
      companyName,
      requirement,
      research,
      researchStructured,
      useCases: list,
    });
  }

  {
    const slide = pres.addSlide();
    applyMaster(slide, palette, { page: 7, total });
    addBenefitsSlide(slide, palette, {
      companyName,
      useCases: list,
      overallBenefits: useCases.overallBenefits,
      requirement,
    });
  }

  await pres.writeFile({ fileName: finalPath });
  return finalPath;
}
