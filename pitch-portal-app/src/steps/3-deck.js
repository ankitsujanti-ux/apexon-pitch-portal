// Widescreen leadership deck on Apexon brand chrome.
// Order: title → agenda → architecture → use cases → thank you.

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

function addBulletPanel(slide, palette, { x, y, w, h, kicker, items, accent, itemMax = 130 }) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: palette.card },
    line: { color: accent || palette.cardBorder, width: 1 },
  });
  slide.addText(pptSafe(kicker), {
    x: x + 0.16,
    y: y + 0.11,
    w: w - 0.32,
    h: 0.22,
    fontSize: 11.5,
    bold: true,
    color: accent || palette.heading,
    fontFace: palette.fontTitle,
  });
  const rows = (items || []).filter(Boolean).slice(0, 3);
  if (!rows.length) return;
  slide.addText(
    rows.map((text) => ({
      text: truncate(text, itemMax),
      options: {
        bullet: { code: "2022" },
        fontSize: 11,
        color: palette.textLight,
        fontFace: palette.fontBody,
        breakLine: true,
        paraSpaceAfter: 4,
      },
    })),
    {
      x: x + 0.16,
      y: y + 0.36,
      w: w - 0.32,
      h: h - 0.46,
      valign: "top",
      wrap: true,
    }
  );
}

const SLIDE_LAYOUTS = ["challenge", "impact", "shift", "journey", "evidence"];

// One idea per slide. Each layout deliberately shows a SUBSET of the content —
// putting challenge + moves + works-with + value + 4 KPIs + data + effort on
// every slide is what made all five look identical and unreadable.
function layoutFor(uc, index) {
  const wanted = String(uc.slideLayout || "").toLowerCase().trim();
  if (SLIDE_LAYOUTS.includes(wanted)) return wanted;
  return SLIDE_LAYOUTS[index % SLIDE_LAYOUTS.length];
}

function addSlideHeader(slide, palette, uc, index, total, companyName) {
  slide.addText(`${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
    x: MARGIN, y: 0.3, w: 1.2, h: 0.24,
    fontSize: 11, bold: true, color: palette.accent, fontFace: palette.fontTitle,
  });
  slide.addText(truncate(companyName, 36), {
    x: 8.2, y: 0.3, w: 4.7, h: 0.24,
    fontSize: 11, color: "9AA6B8", fontFace: palette.fontBody, align: "right",
  });
  slide.addText(slideTitle(uc, companyName), {
    x: MARGIN, y: 0.58, w: 11.6, h: 0.42,
    fontSize: 26, bold: true, color: palette.textLight, fontFace: palette.fontTitle, wrap: true,
  });
  if (uc.subtitle) {
    slide.addText(truncate(uc.subtitle, 84), {
      x: MARGIN, y: 1.04, w: 11.6, h: 0.28,
      fontSize: 14, color: palette.accent, fontFace: palette.fontTitle,
    });
  }
  slide.addShape("rect", {
    x: MARGIN, y: 1.44, w: 1.1, h: 0.03, fill: { color: palette.accent },
  });
}

function addEvidenceStrip(slide, palette, uc) {
  const assumptions = (uc.assumptions || []).slice(0, 2);
  if (!assumptions.length) return;
  const confirmed = assumptions.filter((a) => a.confidence === "confirmed").length;
  const label = confirmed === assumptions.length ? "CONFIRMED" : confirmed ? "PART CONFIRMED" : "INDUSTRY-TYPICAL";
  slide.addText(
    [
      {
        text: `${label}  `,
        options: {
          bold: true, fontSize: 8.5, fontFace: palette.fontTitle,
          color: confirmed === assumptions.length ? "7DDEA0" : palette.accent,
        },
      },
      {
        text: truncate(assumptions.map((a) => a.claim).join("  ·  "), 170),
        options: { fontSize: 8.5, color: "9AA6B8", fontFace: palette.fontBody },
      },
    ],
    { x: MARGIN, y: 6.78, w: 12.48, h: 0.2, wrap: false, valign: "middle" }
  );
}

// Layout A — the problem is the message. Big statement, then the three moves.
function layoutChallenge(slide, palette, uc) {
  slide.addText(truncate(uc.challenge || uc.businessProblem, 330), {
    x: MARGIN, y: 1.72, w: 7.1, h: 2.0,
    fontSize: 15, color: palette.textLight, fontFace: palette.fontBody, wrap: true, valign: "top",
    lineSpacingMultiple: 1.25,
  });
  slide.addText("WHAT WE DO ABOUT IT", {
    x: MARGIN, y: 3.94, w: 7.1, h: 0.24,
    fontSize: 10.5, bold: true, color: "75A2ED", fontFace: palette.fontTitle,
  });
  (uc.solutionMoves || []).slice(0, 3).forEach((move, i) => {
    slide.addText(
      [
        { text: `${pptSafe(move.lead).replace(/[.:]$/, "")}. `, options: { bold: true, color: palette.heading, fontSize: 12, fontFace: palette.fontTitle } },
        { text: truncate(move.detail, 150), options: { color: palette.textLight, fontSize: 12, fontFace: palette.fontBody } },
      ],
      { x: MARGIN, y: 4.26 + i * 0.78, w: 7.1, h: 0.72, wrap: true, valign: "top" }
    );
  });
  addBulletPanel(slide, palette, {
    x: 7.9, y: 1.72, w: 4.98, h: 4.86,
    kicker: "What you get", items: uc.businessValue, accent: "0E7C66", itemMax: 150,
  });
}

// Layout B — the numbers are the message.
function layoutImpact(slide, palette, uc) {
  slide.addText(truncate(uc.whyItMatters || uc.businessProblem, 210), {
    x: MARGIN, y: 1.72, w: 12.48, h: 0.62,
    fontSize: 14, color: palette.textLight, fontFace: palette.fontBody, wrap: true, valign: "top",
  });
  const kpis = (uc.kpis || []).slice(0, 4);
  const w = kpis.length ? (12.48 - (kpis.length - 1) * 0.18) / kpis.length : 3;
  kpis.forEach((kpi, i) => {
    const x = MARGIN + i * (w + 0.18);
    slide.addShape("roundRect", {
      x, y: 2.54, w, h: 2.5, rectRadius: 0.08,
      fill: { color: palette.card }, line: { color: palette.cardBorder, width: 1 },
    });
    slide.addText(String(i + 1).padStart(2, "0"), {
      x: x + 0.18, y: 2.7, w: w - 0.36, h: 0.3,
      fontSize: 15, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(truncate(kpi.name, 30), {
      x: x + 0.18, y: 3.04, w: w - 0.36, h: 0.56,
      fontSize: 15, bold: true, color: palette.heading, fontFace: palette.fontTitle, wrap: true, valign: "top",
    });
    slide.addText(truncate(kpi.why, 140), {
      x: x + 0.18, y: 3.64, w: w - 0.36, h: 1.24,
      fontSize: 11.5, color: palette.textLight, fontFace: palette.fontBody, wrap: true, valign: "top",
    });
  });
  addBulletPanel(slide, palette, {
    x: MARGIN, y: 5.2, w: 12.48, h: 1.38,
    kicker: "Why these move", items: uc.businessValue, accent: "0E7C66", itemMax: 150,
  });
}

// Layout C — today versus after.
function layoutShift(slide, palette, uc) {
  const half = (12.48 - 0.3) / 2;
  slide.addShape("roundRect", {
    x: MARGIN, y: 1.72, w: half, h: 3.3, rectRadius: 0.08,
    fill: { color: "1A1410" }, line: { color: "8A6A3A", width: 1 },
  });
  slide.addText("HOW IT RUNS TODAY", {
    x: MARGIN + 0.2, y: 1.9, w: half - 0.4, h: 0.24,
    fontSize: 10.5, bold: true, color: "FFD48A", fontFace: palette.fontTitle,
  });
  slide.addText(truncate(uc.challenge || uc.businessProblem, 330), {
    x: MARGIN + 0.2, y: 2.22, w: half - 0.4, h: 2.6,
    fontSize: 13.5, color: palette.textLight, fontFace: palette.fontBody, wrap: true, valign: "top",
    lineSpacingMultiple: 1.2,
  });
  slide.addShape("roundRect", {
    x: MARGIN + half + 0.3, y: 1.72, w: half, h: 3.3, rectRadius: 0.08,
    fill: { color: "0E211A" }, line: { color: "0E7C66", width: 1.25 },
  });
  slide.addText("HOW IT RUNS AFTER", {
    x: MARGIN + half + 0.5, y: 1.9, w: half - 0.4, h: 0.24,
    fontSize: 10.5, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
  });
  (uc.solutionMoves || []).slice(0, 3).forEach((move, i) => {
    slide.addText(
      [
        { text: `${pptSafe(move.lead).replace(/[.:]$/, "")}. `, options: { bold: true, color: "FFFFFF", fontSize: 12.5, fontFace: palette.fontTitle } },
        { text: truncate(move.detail, 130), options: { color: palette.textLight, fontSize: 12.5, fontFace: palette.fontBody } },
      ],
      { x: MARGIN + half + 0.5, y: 2.24 + i * 0.88, w: half - 0.4, h: 0.82, wrap: true, valign: "top" }
    );
  });
  addBulletPanel(slide, palette, {
    x: MARGIN, y: 5.18, w: 12.48, h: 1.4,
    kicker: "What that is worth", items: uc.businessValue, accent: "0E7C66", itemMax: 150,
  });
}

// Layout D — the path the work takes.
function layoutJourney(slide, palette, uc) {
  const steps = (uc.steps && uc.steps.length ? uc.steps : (uc.solutionMoves || []).map((m) => m.lead)).slice(0, 4);
  const gap = 0.24;
  const w = steps.length ? (12.48 - (steps.length - 1) * gap) / steps.length : 3;
  steps.forEach((step, i) => {
    const x = MARGIN + i * (w + gap);
    slide.addShape("roundRect", {
      x, y: 1.78, w, h: 1.9, rectRadius: 0.08,
      fill: { color: palette.card }, line: { color: i === steps.length - 1 ? "0E7C66" : "75A2ED", width: 1.25 },
    });
    slide.addShape("ellipse", {
      x: x + 0.2, y: 1.96, w: 0.34, h: 0.34, fill: { color: palette.accent },
    });
    slide.addText(String(i + 1), {
      x: x + 0.2, y: 1.99, w: 0.34, h: 0.28,
      fontSize: 12, bold: true, color: "FFFFFF", fontFace: palette.fontTitle, align: "center",
    });
    slide.addText(truncate(step, 60), {
      x: x + 0.2, y: 2.42, w: w - 0.4, h: 1.1,
      fontSize: 13, bold: true, color: palette.heading, fontFace: palette.fontTitle, wrap: true, valign: "top",
    });
    if (i < steps.length - 1) {
      slide.addText("→", {
        x: x + w, y: 2.5, w: gap, h: 0.3,
        fontSize: 16, bold: true, color: "75A2ED", fontFace: palette.fontTitle, align: "center",
      });
    }
  });
  slide.addText(truncate(uc.whatItShows || uc.benefit, 260), {
    x: MARGIN, y: 3.86, w: 12.48, h: 0.72,
    fontSize: 13.5, color: palette.textLight, fontFace: palette.fontBody, wrap: true, valign: "top",
  });
  addBulletPanel(slide, palette, {
    x: MARGIN, y: 4.72, w: 6.1, h: 1.86,
    kicker: "Works with what you have", items: uc.worksWith, itemMax: 130,
  });
  addBulletPanel(slide, palette, {
    x: MARGIN + 6.38, y: 4.72, w: 6.1, h: 1.86,
    kicker: "What you get", items: uc.businessValue, accent: "0E7C66", itemMax: 130,
  });
}

// Layout E — what it rests on: data, effort, honesty.
function layoutEvidence(slide, palette, uc) {
  slide.addText(truncate(uc.challenge || uc.businessProblem, 300), {
    x: MARGIN, y: 1.72, w: 12.48, h: 0.86,
    fontSize: 14, color: palette.textLight, fontFace: palette.fontBody, wrap: true, valign: "top",
    lineSpacingMultiple: 1.2,
  });
  const stack = Array.isArray(uc.techComponents) && uc.techComponents.length
    ? uc.techComponents.slice(0, 3).join(" · ")
    : "Runs on the platform you choose — nothing here depends on one.";
  addPanel(slide, palette, {
    x: MARGIN, y: 2.74, w: 4.06, h: 2.0,
    kicker: uc.dataPointer?.availability === "new" ? "Data needed — new source" : "Data needed — already there",
    body: typeof uc.dataPointer === "object" ? uc.dataPointer?.description : uc.dataPointer,
    bodyMax: 210,
  });
  addPanel(slide, palette, {
    x: MARGIN + 4.24, y: 2.74, w: 4.06, h: 2.0,
    kicker: `Effort — ${uc.difficulty === "easier" ? "easier" : uc.difficulty === "harder" ? "harder" : "moderate"}`,
    body: uc.difficultyWhy || difficultyLabel(uc),
    bodyMax: 210,
  });
  addPanel(slide, palette, {
    x: MARGIN + 8.48, y: 2.74, w: 4.0, h: 2.0,
    kicker: "How we land it",
    body: uc.proofPoint ? `${stack}. ${uc.proofPoint}` : stack,
    accent: palette.accent,
    bodyMax: 210,
  });
  addBulletPanel(slide, palette, {
    x: MARGIN, y: 4.92, w: 12.48, h: 1.66,
    kicker: "What you get", items: uc.businessValue, accent: "0E7C66", itemMax: 150,
  });
}

const LAYOUT_RENDERERS = {
  challenge: layoutChallenge,
  impact: layoutImpact,
  shift: layoutShift,
  journey: layoutJourney,
  evidence: layoutEvidence,
};

function addUseCaseSlide(slide, palette, uc, index, total, companyName) {
  addSlideHeader(slide, palette, uc, index, total, companyName);
  (LAYOUT_RENDERERS[layoutFor(uc, index)] || layoutChallenge)(slide, palette, uc);
  addEvidenceStrip(slide, palette, uc);
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
