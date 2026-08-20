// Widescreen leadership deck on the Apexon Harness visual system.
// Order matches the Harness template: title → agenda → architecture → use cases → thank you.

import fs from "fs";
import path from "path";
import pptxgen from "pptxgenjs";
import { getPalette } from "../lib/palette.js";
import { slugify } from "../lib/slugify.js";
import { LOGO_PATH, MASTER_BG_PATH } from "../lib/templateTheme.js";
import { logoKeyForSystem, logoPath } from "../lib/logos.js";
import { normalizeArchitecture } from "../lib/briefFirst.js";

const SLIDE_W = 13.33;
const SLIDE_H = 7.5;
const MARGIN = 0.42;
const FOOTER_Y = 7.08;
const LOGO_ASPECT = 192 / 53;

function addBrandLogo(slide, { x, y, h }) {
  if (!fs.existsSync(LOGO_PATH)) return 0;
  const w = h * LOGO_ASPECT;
  slide.addImage({ path: LOGO_PATH, x, y, w, h });
  return w;
}

function addFooter(slide, palette, { page }) {
  slide.addText("© Copyright 2026 Apexon. Confidential & Proprietary.", {
    x: MARGIN,
    y: 7.18,
    w: 8.6,
    h: 0.22,
    fontSize: 10,
    color: "9AA6B8",
    fontFace: palette.fontBody,
  });
  const logoH = 0.22;
  const logoW = logoH * LOGO_ASPECT;
  const logoX = SLIDE_W - MARGIN - logoW;
  slide.addText(String(page), {
    x: logoX - 0.52,
    y: 7.16,
    w: 0.42,
    h: 0.26,
    fontSize: 11,
    color: "9AA6B8",
    fontFace: palette.fontBody,
    align: "right",
  });
  if (fs.existsSync(LOGO_PATH)) {
    addBrandLogo(slide, { x: logoX, y: 7.16, h: logoH });
  } else {
    slide.addText("APEXON", {
      x: logoX,
      y: 7.16,
      w: logoW,
      h: 0.24,
      fontSize: 10,
      bold: true,
      color: palette.textLight,
      fontFace: palette.fontTitle,
      align: "right",
    });
  }
}

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

function applyMaster(slide, palette, { page, wave = false }) {
  if (wave && fs.existsSync(MASTER_BG_PATH)) {
    slide.addImage({ path: MASTER_BG_PATH, x: 0, y: 0, w: SLIDE_W, h: SLIDE_H });
  } else {
    slide.addShape("rect", {
      x: 0,
      y: 0,
      w: SLIDE_W,
      h: SLIDE_H,
      fill: { color: palette.dark },
    });
    slide.addShape("rect", {
      x: 0,
      y: FOOTER_Y,
      w: SLIDE_W,
      h: 0.035,
      fill: { color: palette.accent },
    });
  }
  addFooter(slide, palette, { page });
}

function deckNarrative(useCases, companyName, domain, requirement) {
  return {
    kicker: truncate(useCases.deckKicker || companyName, 28),
    title: truncate(useCases.deckTitle || `${companyName} operating picture`, 64),
    subtitle: truncate(useCases.deckSubtitle || requirement || `${domain} leadership walkthrough`, 110),
    closeLine: truncate(
      useCases.closeLine || `Walk the live demonstration with ${companyName} next.`,
      90
    ),
  };
}

function addTitleSlide(slide, palette, { companyName, domain, narrative, page }) {
  applyMaster(slide, palette, { page, wave: true });
  slide.addText("PREPARED FOR", {
    x: MARGIN,
    y: 1.55,
    w: 8.8,
    h: 0.24,
    fontSize: 11,
    bold: true,
    color: palette.accent,
    fontFace: palette.fontTitle,
  });
  slide.addText(truncate(companyName, 42), {
    x: MARGIN,
    y: 1.8,
    w: 10.5,
    h: 0.36,
    fontSize: 16,
    color: "B8C3D4",
    fontFace: palette.fontBody,
  });
  slide.addText(narrative.kicker, {
    x: MARGIN,
    y: 2.35,
    w: 11.5,
    h: 0.42,
    fontSize: 22,
    color: palette.heading,
    fontFace: palette.fontTitle,
  });
  slide.addText(narrative.title, {
    x: MARGIN,
    y: 2.82,
    w: 11.6,
    h: 1.55,
    fontSize: 36,
    bold: true,
    color: palette.textLight,
    fontFace: palette.fontTitle,
    wrap: true,
    valign: "top",
  });
  slide.addText(narrative.subtitle, {
    x: MARGIN,
    y: 4.5,
    w: 11.2,
    h: 0.7,
    fontSize: 16,
    color: "B8C3D4",
    fontFace: palette.fontBody,
    wrap: true,
  });
  slide.addText(truncate(domain, 40), {
    x: MARGIN,
    y: 5.35,
    w: 8,
    h: 0.28,
    fontSize: 13,
    color: "9AA6B8",
    fontFace: palette.fontBody,
  });
}

function agendaItems({ companyName, requirement, useCases, narrative }) {
  return [
    { label: "Why we are here", note: truncate(requirement, 52) },
    { label: "Proposed architecture", note: truncate(requirement, 52) },
    ...useCases.map((uc) => ({
      label: slideTitle(uc, companyName),
      note: truncate(uc.benefit || uc.businessProblem, 52),
    })),
    { label: "Discussion and next step", note: narrative.closeLine },
  ];
}

function addAgendaSlide(slide, palette, { companyName, requirement, useCases, narrative, page }) {
  applyMaster(slide, palette, { page, wave: true });
  slide.addText("Agenda", {
    x: MARGIN,
    y: 0.28,
    w: 8,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: palette.heading,
    fontFace: palette.fontTitle,
  });
  const items = agendaItems({ companyName, requirement, useCases, narrative });
  const mid = Math.ceil(items.length / 2);
  items.forEach((item, i) => {
    const col = i < mid ? 0 : 1;
    const row = i < mid ? i : i - mid;
    const x = MARGIN + col * 6.4;
    const y = 1.05 + row * 1.35;
    slide.addText(String(i + 1).padStart(2, "0"), {
      x,
      y,
      w: 0.7,
      h: 0.4,
      fontSize: 22,
      bold: true,
      color: palette.accent,
      fontFace: palette.fontTitle,
    });
    slide.addText(truncate(item.label, 36), {
      x: x + 0.78,
      y,
      w: 5.3,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: palette.textLight,
      fontFace: palette.fontTitle,
      wrap: true,
    });
    slide.addText(truncate(item.note, 70), {
      x: x + 0.78,
      y: y + 0.4,
      w: 5.3,
      h: 0.7,
      fontSize: 13,
      color: "B8C3D4",
      fontFace: palette.fontBody,
      wrap: true,
    });
  });
}

function addThanksSlide(slide, palette, { companyName, narrative, page }) {
  applyMaster(slide, palette, { page, wave: true });
  if (fs.existsSync(LOGO_PATH)) {
    const logoH = 0.48;
    const logoW = logoH * LOGO_ASPECT;
    addBrandLogo(slide, { x: (SLIDE_W - logoW) / 2, y: 1.9, h: logoH });
  }
  slide.addText("Thank you", {
    x: MARGIN,
    y: 2.7,
    w: 12.48,
    h: 0.7,
    fontSize: 40,
    bold: true,
    color: palette.heading,
    fontFace: palette.fontTitle,
    align: "center",
  });
  slide.addText(truncate(companyName, 42), {
    x: MARGIN,
    y: 3.5,
    w: 12.48,
    h: 0.4,
    fontSize: 18,
    color: palette.textLight,
    fontFace: palette.fontTitle,
    align: "center",
  });
  slide.addText(narrative.closeLine, {
    x: 1.8,
    y: 4.1,
    w: 9.7,
    h: 0.8,
    fontSize: 16,
    color: "B8C3D4",
    fontFace: palette.fontBody,
    align: "center",
    wrap: true,
  });
}

function addPanel(slide, palette, { x, y, w, h, kicker, title, body, accent, bodyMax = 160 }) {
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
    slide.addText(truncate(title, 42), {
      x: x + 0.16,
      y: cursorY,
      w: w - 0.32,
      h: 0.36,
      fontSize: 13,
      bold: true,
      color: palette.heading,
      fontFace: palette.fontTitle,
      wrap: true,
      valign: "top",
    });
    cursorY += 0.38;
  }
  slide.addText(truncate(body, bodyMax) || " ", {
    x: x + 0.16,
    y: cursorY,
    w: w - 0.32,
    h: Math.max(0.28, h - (cursorY - y) - 0.1),
    fontSize: 12,
    color: palette.textLight,
    fontFace: palette.fontBody,
    valign: "top",
    wrap: true,
  });
}

function slideTitle(uc, companyName) {
  const raw = String(uc.title || "Use case");
  const stripped = raw.replace(new RegExp(`\\s*[\\u2014\\u2013\\-]\\s*${companyName}\\s*$`, "i"), "").trim();
  return truncate(stripped || raw, 48);
}

function difficultyLabel(uc) {
  if (uc.difficulty === "easier") return "Easier — data this industry already holds";
  if (uc.difficulty === "harder") return "Harder — new source or unconfirmed join";
  return "Moderate — mix of existing and new work";
}

function addArchitectureSlide(slide, palette, { companyName, domain, requirement, researchStructured, architecture, useCases }) {
  const arch = normalizeArchitecture(architecture, {
    companyName,
    domain,
    requirement,
    researchStructured,
    useCases,
  });
  const sources = (arch.sources || []).map((s) => s.name || s).filter(Boolean).slice(0, 8);
  const stages = arch.stages || [];
  const target = arch.target || { name: "Target platform", components: [] };
  const guards = arch.guards || [];
  const hasGuards = guards.length > 0;
  const colH = hasGuards ? 4.4 : 5.55;

  slide.addText(truncate(arch.title || "Proposed architecture", 42), {
    x: MARGIN, y: 0.14, w: 12.4, h: 0.3, fontSize: 22, bold: true,
    color: palette.heading, fontFace: palette.fontTitle,
  });
  slide.addText(truncate(arch.subtitle || `${companyName}: path for this mandate.`, 140), {
    x: MARGIN, y: 0.46, w: 12.4, h: 0.28, fontSize: 12, color: "B8C3D4", fontFace: palette.fontBody,
  });

  slide.addShape("roundRect", {
    x: 0.28, y: 0.82, w: 2.55, h: colH, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "75A2ED", width: 1.25 },
  });
  slide.addText("SOURCES FOR THIS BRIEF", {
    x: 0.4, y: 0.9, w: 2.3, h: 0.28, fontSize: 10, bold: true,
    color: "75A2ED", fontFace: palette.fontTitle, align: "center",
  });
  const srcH = Math.min(0.86, (colH - 0.5) / Math.max(2, Math.ceil(Math.max(sources.length, 1) / 2)));
  sources.forEach((name, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.42 + col * 1.18;
    const y = 1.24 + row * (srcH + 0.08);
    slide.addShape("roundRect", {
      x, y, w: 1.1, h: srcH, rectRadius: 0.06,
      fill: { color: "0B1220" }, line: { color: "243556", width: 1 },
    });
    const img = logoPath(logoKeyForSystem(name));
    if (img && srcH > 0.55) {
      slide.addImage({ path: img, x: x + 0.28, y: y + 0.06, w: 0.54, h: 0.36 });
    }
    slide.addText(truncate(name, 22), {
      x: x + 0.04, y: y + (srcH > 0.55 ? srcH - 0.32 : 0.08), w: 1.02, h: 0.28,
      fontSize: 9, color: palette.textLight, fontFace: palette.fontBody, align: "center", wrap: true,
    });
  });

  const bandH = (colH - (Math.max(stages.length, 1) - 1) * 0.1) / Math.max(1, stages.length);
  stages.forEach((band, bi) => {
    const y = 0.82 + bi * (bandH + 0.1);
    const color = band.color || ["1D6EE4", "0E7C66", "E54A24"][bi] || "1D6EE4";
    slide.addShape("roundRect", {
      x: 3.0, y, w: 7.05, h: bandH, rectRadius: 0.08,
      fill: { color: palette.card }, line: { color, width: 1.25 },
    });
    slide.addShape("rect", { x: 3.0, y, w: 0.1, h: bandH, fill: { color } });
    slide.addText(truncate(band.title, 48), {
      x: 3.22, y: y + 0.06, w: 6.7, h: 0.24, fontSize: 11, bold: true, color, fontFace: palette.fontTitle,
    });
    const steps = band.steps || [];
    const stepW = (6.7 - (Math.max(steps.length, 1) - 1) * 0.08) / Math.max(1, steps.length);
    steps.forEach((step, si) => {
      const sx = 3.22 + si * (stepW + 0.08);
      slide.addShape("roundRect", {
        x: sx, y: y + 0.34, w: stepW, h: Math.max(0.5, bandH - 0.44), rectRadius: 0.06,
        fill: { color: "0B1220" }, line: { color: "243556", width: 1 },
      });
      slide.addText(String(si + 1), {
        x: sx + 0.06, y: y + 0.38, w: 0.28, h: 0.2, fontSize: 10, bold: true, color, fontFace: palette.fontTitle,
      });
      slide.addText(truncate(step, 48), {
        x: sx + 0.08, y: y + 0.58, w: stepW - 0.16, h: Math.max(0.32, bandH - 0.7),
        fontSize: 10, color: palette.textLight, fontFace: palette.fontBody, wrap: true,
      });
    });
  });

  slide.addShape("roundRect", {
    x: 10.2, y: 0.82, w: 2.75, h: colH, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "A78BFA", width: 1.25 },
  });
  slide.addText("TARGET FOR THIS MANDATE", {
    x: 10.32, y: 0.9, w: 2.5, h: 0.28, fontSize: 10, bold: true,
    color: "C4B5FD", fontFace: palette.fontTitle, align: "center",
  });
  const targetImg = logoPath(/fabric/i.test(target.name || "") ? "fabric" : logoKeyForSystem(target.name));
  if (targetImg) slide.addImage({ path: targetImg, x: 11.05, y: 1.28, w: 1.05, h: 0.85 });
  slide.addText(truncate(target.name || "Target platform", 28), {
    x: 10.32, y: 2.2, w: 2.5, h: 0.4, fontSize: 13, bold: true,
    color: palette.textLight, fontFace: palette.fontTitle, align: "center", wrap: true,
  });
  (target.components || []).slice(0, 4).forEach((label, i) => {
    const y = 2.7 + i * 0.55;
    const img = logoPath(logoKeyForSystem(label));
    if (img) slide.addImage({ path: img, x: 10.45, y: y, w: 0.36, h: 0.36 });
    slide.addText(truncate(label, 22), {
      x: 10.9, y: y + 0.04, w: 1.85, h: 0.3, fontSize: 12, color: palette.textLight, fontFace: palette.fontBody,
    });
  });

  if (!hasGuards) return;

  slide.addText("CONTROLS FOR THIS BRIEF", {
    x: MARGIN, y: 5.38, w: 8, h: 0.2, fontSize: 10, bold: true, color: "9AA6B8", fontFace: palette.fontTitle,
  });
  const gw = (12.76 - (guards.length - 1) * 0.14) / guards.length;
  guards.forEach((layer, i) => {
    const x = 0.28 + i * (gw + 0.14);
    slide.addShape("roundRect", {
      x, y: 5.5, w: gw, h: 1.18, rectRadius: 0.08,
      fill: { color: palette.card }, line: { color: layer.color || "1D6EE4", width: 1.25 },
    });
    slide.addText(String(layer.n || i + 1), {
      x: x + 0.12, y: 5.58, w: 0.55, h: 0.2, fontSize: 12, bold: true,
      color: layer.color || palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(truncate(layer.title, 22), {
      x: x + 0.7, y: 5.58, w: gw - 0.86, h: 0.2, fontSize: 13, bold: true,
      color: palette.textLight, fontFace: palette.fontTitle,
    });
    slide.addText(truncate(layer.body, 70), {
      x: x + 0.12, y: 5.82, w: gw - 0.24, h: 0.72, fontSize: 12, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
    });
  });
}

function moveCopy(uc) {
  const benefit = pptSafe(uc.benefit);
  const fit = pptSafe(uc.solutionFit);
  if (benefit && fit && !benefit.toLowerCase().includes(fit.slice(0, 18).toLowerCase())) {
    return `${benefit} ${fit}`;
  }
  return benefit || fit;
}

function addUseCaseSlide(slide, palette, uc, index, total, companyName) {
  slide.addText(`USE CASE  ${String(index + 1).padStart(2, "0")}  /  ${String(total).padStart(2, "0")}`, {
    x: MARGIN,
    y: 0.16,
    w: 5.2,
    h: 0.2,
    fontSize: 11,
    bold: true,
    color: palette.accent,
    fontFace: palette.fontTitle,
  });
  slide.addText(truncate(companyName, 36), {
    x: 8.2,
    y: 0.16,
    w: 4.7,
    h: 0.2,
    fontSize: 11,
    color: "9AA6B8",
    fontFace: palette.fontBody,
    align: "right",
  });
  slide.addText(slideTitle(uc, companyName), {
    x: MARGIN,
    y: 0.38,
    w: 12.48,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: palette.textLight,
    fontFace: palette.fontTitle,
    wrap: true,
  });

  addPanel(slide, palette, {
    x: MARGIN,
    y: 0.86,
    w: 6.2,
    h: 2.12,
    kicker: "The business pain",
    title: "What leadership feels today",
    body: uc.businessProblem,
    bodyMax: 180,
  });
  addPanel(slide, palette, {
    x: 6.85,
    y: 0.86,
    w: 6.05,
    h: 2.12,
    kicker: "The move",
    title: "What they get",
    body: moveCopy(uc),
    accent: "0E7C66",
    bodyMax: 180,
  });

  const kpis = (uc.kpis || []).slice(0, 4);
  const kpiW = kpis.length ? (12.48 - (kpis.length - 1) * 0.16) / kpis.length : 3;
  kpis.forEach((kpi, i) => {
    addPanel(slide, palette, {
      x: MARGIN + i * (kpiW + 0.16),
      y: 3.12,
      w: kpiW,
      h: 1.42,
      kicker: "KPI",
      title: kpi.name,
      body: kpi.why,
      bodyMax: 70,
    });
  });

  const dataLine = typeof uc.dataPointer === "string"
    ? uc.dataPointer
    : uc.dataPointer?.description || "Operational data this industry already holds";
  const stack = Array.isArray(uc.techComponents) ? uc.techComponents.slice(0, 3).join(" · ") : "Microsoft Fabric";
  addPanel(slide, palette, {
    x: MARGIN,
    y: 4.68,
    w: 5.9,
    h: 1.52,
    kicker: "Data",
    title: uc.dataPointer?.availability === "new" ? "New join or source" : "Likely already there",
    body: dataLine,
    bodyMax: 110,
  });
  addPanel(slide, palette, {
    x: 6.54,
    y: 4.68,
    w: 3.2,
    h: 1.52,
    kicker: "Effort",
    title: uc.difficulty === "easier" ? "Easier" : uc.difficulty === "harder" ? "Harder" : "Moderate",
    body: uc.difficultyWhy || difficultyLabel(uc),
    bodyMax: 90,
  });
  addPanel(slide, palette, {
    x: 9.94,
    y: 4.68,
    w: 2.96,
    h: 1.52,
    kicker: "On the platform",
    title: "How we land it",
    body: stack,
    accent: palette.accent,
    bodyMax: 80,
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
  const narrative = deckNarrative(useCases, companyName, domain, requirement);
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Apexon";
  pres.title = `${pptSafe(narrative.title)} — ${pptSafe(companyName)}`;
  pres.subject = pptSafe(`${companyName} — ${requirement}`);

  let page = 1;

  {
    const slide = pres.addSlide();
    addTitleSlide(slide, palette, { companyName, domain, narrative, page });
    page += 1;
  }

  {
    const slide = pres.addSlide();
    addAgendaSlide(slide, palette, { companyName, requirement, useCases: list, narrative, page });
    page += 1;
  }

  {
    const slide = pres.addSlide();
    applyMaster(slide, palette, { page });
    addArchitectureSlide(slide, palette, { companyName, domain, requirement, researchStructured, architecture: useCases.architecture, useCases: list });
    page += 1;
  }

  list.forEach((uc, i) => {
    const slide = pres.addSlide();
    applyMaster(slide, palette, { page });
    addUseCaseSlide(slide, palette, uc, i, list.length, companyName);
    page += 1;
  });

  {
    const slide = pres.addSlide();
    addThanksSlide(slide, palette, { companyName, narrative, page });
  }

  await pres.writeFile({ fileName: finalPath });
  return finalPath;
}
