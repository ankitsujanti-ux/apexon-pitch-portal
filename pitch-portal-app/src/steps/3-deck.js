// Widescreen leadership deck on Apexon brand chrome.
// Order: title → agenda → architecture → use cases → thank you.

import fs from "fs";
import { toLabel, fitLine, fitTitle, isChatRequest } from "../lib/text.js";
import { packRegions } from "../lib/slideGrid.js";
import { composeSlide } from "../lib/composeVisuals.js";
import path from "path";
import pptxgen from "pptxgenjs";
import { getPalette } from "../lib/palette.js";
import { slugify } from "../lib/slugify.js";
import { LOGO_PATH, MASTER_BG_PATH } from "../lib/templateTheme.js";
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

// Body copy keeps whole sentences so a shortened paragraph still reads as
// finished prose. Nothing is ever cut mid-word.
function truncate(text, maxChars) {
  return fitLine(pptSafe(text), maxChars);
}

function heading(text, maxWords = 8) {
  return fitTitle(pptSafe(text), maxWords);
}

// Short slots (kickers, node labels, step names) get a clean noun phrase rather
// than a severed clause.
function label(text, maxWords = 5) {
  return toLabel(pptSafe(text), maxWords);
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
  const rawAsk = isChatRequest(requirement);
  return {
    kicker: heading(useCases.deckKicker || companyName, 4),
    title: heading(useCases.deckTitle || `${companyName} operating picture`, 9),
    subtitle: truncate(
      useCases.deckSubtitle ||
        (rawAsk
          ? `Where AI should change how ${companyName} serves members, and what to prove first.`
          : requirement) ||
        `${domain} leadership walkthrough`,
      140
    ),
    closeLine: truncate(
      useCases.closeLine || `Walk the live demonstration with ${companyName} next.`,
      110
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
  const why = isChatRequest(requirement)
    ? narrative.subtitle
    : truncate(requirement, 90);
  return [
    { label: "Why we are here", note: why },
    { label: "How this would work", note: truncate(`The path ${companyName} would take, on systems it already runs.`, 90) },
    ...useCases.map((uc) => ({
      label: slideTitle(uc, companyName),
      note: truncate(uc.slide?.idea || uc.benefit || uc.businessProblem, 90),
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
    slide.addText(heading(item.label, 8), {
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
    slide.addText(truncate(item.note, 90), {
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

function addPanel(slide, palette, { x, y, w, h, kicker, title, body, accent, bodyMax }) {
  const reserved = (kicker ? 0.22 : 0) + (title ? 0.38 : 0) + 0.22;
  const lines = Math.max(1, Math.floor((h - reserved) / 0.22));
  const cols = Math.max(12, Math.floor((w - 0.32) * 10));
  const fit = Math.max(40, lines * cols);
  const max = Math.min(Number.isFinite(bodyMax) ? bodyMax : fit, fit);
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
  slide.addText(truncate(body, max) || " ", {
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
  return heading(stripped || raw, 8);
}

function difficultyLabel(uc) {
  if (uc.difficulty === "easier") return "Easier — data this industry already holds";
  if (uc.difficulty === "harder") return "Harder — new source or unconfirmed join";
  return "Moderate — mix of existing and new work";
}

// Designed for the brief, not borrowed. The old version was a three-column
// sources | stages | target plumbing diagram with meta-language kickers and a
// row of identical database icons. This tells the operating story instead: the
// stages this company would actually go through, what each one produces, and
// the systems it is built on named plainly underneath.
function addArchitectureSlide(slide, palette, { companyName, domain, requirement, researchStructured, architecture, useCases }) {
  const arch = normalizeArchitecture(architecture, {
    companyName, domain, requirement, researchStructured, useCases,
  });
  const sources = (arch.sources || []).map((s) => s.name || s).filter(Boolean).slice(0, 7);
  const stages = (arch.stages || []).slice(0, 4);
  const target = arch.target || {};
  const guards = (arch.guards || []).slice(0, 3);
  const platformNamed = target.name && target.name !== "Operating platform";

  slide.addText(heading(arch.title || "How this works", 8), {
    x: MARGIN, y: 0.3, w: 12.4, h: 0.42, fontSize: 26, bold: true,
    color: palette.textLight, fontFace: palette.fontTitle, wrap: true,
  });
  slide.addText(truncate(arch.subtitle || `What ${companyName} would put in place, and what it runs on.`, 160), {
    x: MARGIN, y: 0.76, w: 12.4, h: 0.36, fontSize: 13, color: palette.accent, fontFace: palette.fontBody, wrap: true,
  });
  slide.addShape("rect", { x: MARGIN, y: 1.16, w: 1.1, h: 0.03, fill: { color: palette.accent } });

  // The stages, as a left-to-right path. Each card carries its own steps, so
  // there is no separate legend to cross-reference.
  const gap = 0.26;
  const w = stages.length ? (12.48 - (stages.length - 1) * gap) / stages.length : 12.48;
  const cardY = 1.46;
  // Height follows the longest stage. A fixed height left a third of every card
  // empty, which is what made the slide look unfinished.
  const maxSteps = Math.max(1, ...stages.map((s) => Math.min(4, (s.steps || []).length)));
  const cardH = 1.34 + maxSteps * 0.34;
  stages.forEach((stage, i) => {
    const x = MARGIN + i * (w + gap);
    const last = i === stages.length - 1;
    slide.addShape("roundRect", {
      x, y: cardY, w, h: cardH, rectRadius: 0.1,
      fill: { color: palette.card },
      line: { color: last ? "0E7C66" : "75A2ED", width: last ? 1.75 : 1.25 },
    });
    slide.addText(String(i + 1).padStart(2, "0"), {
      x: x + 0.22, y: cardY + 0.18, w: w - 0.44, h: 0.28,
      fontSize: 13, bold: true, color: last ? "7DDEA0" : palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(label(stage.title, 6), {
      x: x + 0.22, y: cardY + 0.5, w: w - 0.44, h: 0.66,
      fontSize: 16, bold: true, color: palette.heading, fontFace: palette.fontTitle,
      wrap: true, valign: "top",
    });
    const steps = (stage.steps || []).slice(0, 4).map((s) => ({
      text: label(s, 7),
      options: { fontSize: 12, color: palette.textLight, fontFace: palette.fontBody, bullet: { indent: 14 }, paraSpaceAfter: 7 },
    }));
    if (steps.length) {
      slide.addText(steps, {
        x: x + 0.22, y: cardY + 1.2, w: w - 0.44, h: cardH - 1.4, valign: "top",
      });
    }
    if (!last) {
      slide.addText("→", {
        x: x + w, y: cardY + 1.5, w: gap, h: 0.3,
        fontSize: 15, bold: true, color: "75A2ED", fontFace: palette.fontTitle, align: "center",
      });
    }
  });

  // Named systems as plain text chips. No stock database icons — they carried no
  // information and repeated seven times.
  const stripY = cardY + cardH + 0.3;
  slide.addText("BUILT ON WHAT YOU ALREADY RUN", {
    x: MARGIN, y: stripY, w: 6.0, h: 0.24,
    fontSize: 10, bold: true, color: "8E9AB0", fontFace: palette.fontTitle,
  });
  let chipX = MARGIN;
  let chipY = stripY + 0.3;
  sources.forEach((name) => {
    const text = label(name, 4);
    const chipW = Math.min(2.6, Math.max(0.9, text.length * 0.088 + 0.34));
    if (chipX + chipW > MARGIN + 12.48) {
      chipX = MARGIN;
      chipY += 0.44;
    }
    slide.addShape("roundRect", {
      x: chipX, y: chipY, w: chipW, h: 0.36, rectRadius: 0.18,
      fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
    });
    slide.addText(text, {
      x: chipX, y: chipY, w: chipW, h: 0.36,
      fontSize: 11, color: palette.textLight, fontFace: palette.fontBody,
      align: "center", valign: "middle", wrap: false,
    });
    chipX += chipW + 0.14;
  });

  // Whatever height is left goes to the things leadership asks about next:
  // what it runs on, and what keeps it safe. Filling this band is what stops
  // the slide trailing off into empty navy.
  const bandY = chipY + 0.36 + 0.34;
  const bandH = Math.max(1.0, 6.62 - bandY);
  const cards = [
    platformNamed
      ? { k: "What it runs on", v: `${label(target.name, 4)}, named in your brief.` }
      : { k: "What it runs on", v: "Your choice of platform. Nothing here depends on one vendor." },
    ...(guards.length
      ? guards.map((g) => ({ k: label(g.title, 4), v: pptSafe(g.body) }))
      : [
          {
            k: "What stays as it is",
            v: "The systems above keep running and stay the system of record. Nothing is replaced.",
          },
          {
            k: "How you check it",
            v: "Every number traces back to the feed it came from, so the view can be challenged.",
          },
        ]),
  ].slice(0, 4);
  const cw = (12.48 - (cards.length - 1) * gap) / cards.length;
  cards.forEach((card, i) => {
    const x = MARGIN + i * (cw + gap);
    slide.addShape("roundRect", {
      x, y: bandY, w: cw, h: bandH, rectRadius: 0.08,
      fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
    });
    slide.addText(pptSafe(card.k).toUpperCase(), {
      x: x + 0.18, y: bandY + 0.14, w: cw - 0.36, h: 0.22,
      fontSize: 11, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(truncate(card.v, 120), {
      x: x + 0.18, y: bandY + 0.42, w: cw - 0.36, h: bandH - 0.58,
      fontSize: 11.5, color: palette.textLight, fontFace: palette.fontBody,
      wrap: true, valign: "top",
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
  if (uc.slide?.idea || uc.subtitle) {
    slide.addText(truncate(uc.slide?.idea || uc.subtitle, 84), {
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
          bold: true, fontSize: 10, fontFace: palette.fontTitle,
          color: confirmed === assumptions.length ? "7DDEA0" : palette.accent,
        },
      },
      {
        text: truncate(assumptions.map((a) => a.claim).join("  ·  "), 140),
        options: { fontSize: 10, color: "9AA6B8", fontFace: palette.fontBody },
      },
    ],
    { x: MARGIN, y: 6.78, w: 12.48, h: 0.2, wrap: false, valign: "middle" }
  );
}

function paintPacked(slide, palette, uc, regions) {
  const placed = packRegions(regions);
  placed.forEach(({ x, y, w, h, region }) => {
    const kind = region.kind;
    const accent =
      region.accent === "good" ? "0E7C66" : region.accent === "warn" ? "8A6A3A" : palette.cardBorder;
    if (kind === "list") {
      addBulletPanel(slide, palette, {
        x, y, w, h,
        kicker: region.kicker || region.title || "What follows",
        items: region.items && region.items.length ? region.items : uc.businessValue,
        accent,
        itemMax: 140,
      });
      return;
    }
    if (kind === "kpis") {
      const kpis = (uc.kpis || []).slice(0, 4);
      const gap = 0.2;
      const kw = kpis.length ? (w - (kpis.length - 1) * gap) / kpis.length : w;
      kpis.forEach((k, i) => {
        addPanel(slide, palette, {
          x: x + i * (kw + gap), y, w: kw, h,
          kicker: "Watch this",
          title: k.name,
          body: k.why,
          accent: palette.accent,
          bodyMax: 110,
        });
      });
      return;
    }
    if (kind === "steps") {
      const steps = (region.items && region.items.length ? region.items : uc.steps || (uc.solutionMoves || []).map((m) => m.lead)).slice(0, 4);
      const gap = 0.16;
      const sw = steps.length ? (w - (steps.length - 1) * gap) / steps.length : w;
      steps.forEach((step, i) => {
        addPanel(slide, palette, {
          x: x + i * (sw + gap), y, w: sw, h,
          kicker: String(i + 1).padStart(2, "0"),
          title: "",
          body: step,
          accent: i === steps.length - 1 ? "0E7C66" : palette.cardBorder,
          bodyMax: 90,
        });
      });
      return;
    }
    if (kind === "compare" || kind === "split") {
      const half = (w - 0.2) / 2;
      addPanel(slide, palette, {
        x, y, w: half, h,
        kicker: region.kicker || "Today",
        title: "",
        body: region.items?.[0] || uc.challenge,
        accent: "8A6A3A",
        bodyMax: 220,
      });
      addPanel(slide, palette, {
        x: x + half + 0.2, y, w: half, h,
        kicker: region.title || "After",
        title: "",
        body: region.items?.[1] || (uc.solutionMoves || []).map((m) => m.lead).join(". "),
        accent: "0E7C66",
        bodyMax: 220,
      });
      return;
    }
    addPanel(slide, palette, {
      x, y, w, h,
      kicker: region.kicker || (kind === "callout" ? "Why this slide" : kind === "quote" ? "The point" : "In this job"),
      title: region.title || "",
      body: region.body || (region.items || []).join(" ") || uc.subtitle || uc.benefit,
      accent: kind === "callout" ? palette.accent : accent,
      bodyMax: kind === "quote" ? 280 : 180,
    });
  });
}

function addUseCaseSlide(slide, palette, uc, index, total, companyName) {
  const composed = composeSlide(uc, index);
  const painted = { ...uc, slide: composed };
  addSlideHeader(slide, palette, painted, index, total, companyName);
  paintPacked(slide, palette, painted, composed.regions);
  addEvidenceStrip(slide, palette, painted);
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

  const list = useCases.useCases.slice(0, 7);
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
