// STEP 3 - Pitch deck (.pptx)
// Visual system from Apexon Harness template:
// navy field, orange-red accent, Arial/Helvetica, card layout.

import fs from "fs";
import path from "path";
import pptxgen from "pptxgenjs";
import { getPalette } from "../lib/palette.js";
import { slugify } from "../lib/slugify.js";

const SLIDE_W = 13.33;
const SLIDE_H = 7.5;
const MARGIN = 0.5;

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

function splitIntoChunks(text, count) {
  const paragraphs = pptSafe(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length >= count) {
    const chunks = paragraphs.slice(0, count - 1);
    chunks.push(paragraphs.slice(count - 1).join(" "));
    return chunks;
  }
  if (paragraphs.length > 0) return paragraphs;
  return [pptSafe(text) || " "];
}

function applyMaster(slide, palette) {
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: SLIDE_H,
    fill: { color: palette.dark },
    line: { color: palette.dark },
  });
  slide.addShape("rect", {
    x: 0,
    y: 6.85,
    w: SLIDE_W,
    h: 0.65,
    fill: { color: palette.primary },
    line: { color: palette.primary },
  });
  slide.addShape("rect", {
    x: 0,
    y: 6.82,
    w: SLIDE_W,
    h: 0.06,
    fill: { color: palette.accent },
    line: { color: palette.accent },
  });
  slide.addText("APEXON", {
    x: SLIDE_W - 2.2,
    y: 6.95,
    w: 1.7,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: palette.textLight,
    fontFace: palette.fontTitle,
    align: "right",
  });
}

function addCard(slide, palette, { x, y, w, h, kicker, title, body }) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: palette.card },
    line: { color: palette.cardBorder, width: 1 },
  });

  let cursorY = y + 0.18;
  if (kicker) {
    slide.addText(pptSafe(kicker).toUpperCase(), {
      x: x + 0.24,
      y: cursorY,
      w: w - 0.48,
      h: 0.22,
      fontSize: 10,
      bold: true,
      color: palette.accent,
      fontFace: palette.fontTitle,
    });
    cursorY += 0.26;
  }
  if (title) {
    slide.addText(pptSafe(title), {
      x: x + 0.24,
      y: cursorY,
      w: w - 0.48,
      h: 0.32,
      fontSize: 13,
      bold: true,
      color: palette.heading,
      fontFace: palette.fontTitle,
    });
    cursorY += 0.36;
  }
  slide.addText(truncate(body, 900) || " ", {
    x: x + 0.24,
    y: cursorY,
    w: w - 0.48,
    h: h - (cursorY - y) - 0.16,
    fontSize: 13,
    color: palette.textLight,
    fontFace: palette.fontBody,
    valign: "top",
    wrap: true,
  });
}

export async function buildDeck({
  companyName,
  domain,
  requirement,
  research,
  useCases,
  outputPath,
}) {
  if (!companyName || !domain || !useCases || !Array.isArray(useCases.useCases)) {
    throw new Error(
      "buildDeck requires companyName, domain, and a useCases object with a useCases array (Step 2's output)"
    );
  }

  const palette = getPalette(domain, companyName);
  const slug = slugify(companyName);
  const finalPath = outputPath || path.join("./output", `${slug}-pitch-deck.pptx`);
  fs.mkdirSync(path.dirname(finalPath), { recursive: true });

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Apexon";
  pres.title = `${pptSafe(companyName)} - ${pptSafe(domain)} Solutioning Pitch`;
  pres.subject = "Apexon Harness-governed Microsoft Fabric pitch";

  {
    const slide = pres.addSlide();
    applyMaster(slide, palette);
    slide.addText("APEXON  |  SOLUTIONING PITCH", {
      x: MARGIN,
      y: 2.05,
      w: 11.5,
      h: 0.32,
      fontSize: 12,
      bold: true,
      color: palette.accent,
      fontFace: palette.fontTitle,
    });
    slide.addText(pptSafe(companyName), {
      x: MARGIN,
      y: 2.45,
      w: 12.2,
      h: 1.0,
      fontSize: 36,
      bold: true,
      color: palette.textLight,
      fontFace: palette.fontTitle,
    });
    slide.addText(`${pptSafe(domain)}  |  Harness-governed Fabric and AI`, {
      x: MARGIN,
      y: 3.5,
      w: 12.2,
      h: 0.4,
      fontSize: 18,
      color: palette.heading,
      fontFace: palette.fontBody,
    });
    slide.addText(truncate(requirement, 220) || " ", {
      x: MARGIN,
      y: 4.1,
      w: 11.4,
      h: 1.1,
      fontSize: 15,
      color: "D7DEEA",
      fontFace: palette.fontBody,
      wrap: true,
    });
  }

  {
    const slide = pres.addSlide();
    applyMaster(slide, palette);
    slide.addText(`About ${pptSafe(companyName)}`, {
      x: MARGIN,
      y: 0.28,
      w: 12.2,
      h: 0.45,
      fontSize: 22,
      bold: true,
      color: palette.textLight,
      fontFace: palette.fontTitle,
    });
    const [chunkA, chunkB] = splitIntoChunks(research, 2);
    const cardW = (SLIDE_W - MARGIN * 2 - 0.28) / 2;
    addCard(slide, palette, {
      x: MARGIN,
      y: 0.9,
      w: cardW,
      h: 3.85,
      kicker: "Company",
      title: "How they operate",
      body: chunkA,
    });
    addCard(slide, palette, {
      x: MARGIN + cardW + 0.28,
      y: 0.9,
      w: cardW,
      h: 3.85,
      kicker: pptSafe(domain),
      title: "Data, systems, compliance",
      body: chunkB,
    });
    addCard(slide, palette, {
      x: MARGIN,
      y: 4.9,
      w: SLIDE_W - MARGIN * 2,
      h: 1.7,
      kicker: "Requirement",
      title: "What we are here to solve",
      body: requirement,
    });
  }

  useCases.useCases.forEach((uc, i) => {
    const slide = pres.addSlide();
    applyMaster(slide, palette);
    slide.addText(truncate(uc.title || `Use case ${i + 1}`, 90), {
      x: MARGIN,
      y: 0.22,
      w: 12.2,
      h: 0.7,
      fontSize: 18,
      bold: true,
      color: palette.textLight,
      fontFace: palette.fontTitle,
      wrap: true,
    });
    slide.addText(`Use case ${i + 1} of ${useCases.useCases.length}`, {
      x: MARGIN,
      y: 0.92,
      w: 4,
      h: 0.24,
      fontSize: 11,
      color: palette.heading,
      fontFace: palette.fontBody,
    });

    const cardW = (SLIDE_W - MARGIN * 2 - 0.28) / 2;
    addCard(slide, palette, {
      x: MARGIN,
      y: 1.28,
      w: cardW,
      h: 2.55,
      kicker: "Problem",
      title: "What is slowing them down",
      body: uc.businessProblem,
    });
    addCard(slide, palette, {
      x: MARGIN + cardW + 0.28,
      y: 1.28,
      w: cardW,
      h: 2.55,
      kicker: "Solution",
      title: "How Fabric and Foundry help",
      body: uc.solutionFit,
    });

    const dataDesc =
      typeof uc.dataPointer === "string"
        ? uc.dataPointer
        : uc.dataPointer?.description || "Operational data already inside the company";
    const availability =
      uc.dataPointer?.availability === "new"
        ? "New data or integration needed"
        : "Likely already exists";
    const tech = Array.isArray(uc.techComponents)
      ? uc.techComponents.map((t) => pptSafe(t)).filter(Boolean).join("  |  ")
      : "Microsoft Fabric  |  Real-Time Intelligence  |  Azure AI Foundry";
    addCard(slide, palette, {
      x: MARGIN,
      y: 4.0,
      w: SLIDE_W - MARGIN * 2,
      h: 2.55,
      kicker: availability,
      title: "Data and technology",
      body: `${truncate(dataDesc, 240)}\n\n${truncate(tech, 220)}`,
    });
  });

  {
    const slide = pres.addSlide();
    applyMaster(slide, palette);
    slide.addText("Let's build this together", {
      x: MARGIN,
      y: 2.35,
      w: 12.2,
      h: 0.7,
      fontSize: 32,
      bold: true,
      color: palette.textLight,
      fontFace: palette.fontTitle,
    });
    slide.addText(
      `An interactive HTML mockup for ${pptSafe(companyName)} accompanies this deck. Open the GitHub Pages link to walk the top use cases with live, synthetic data.`,
      {
        x: MARGIN,
        y: 3.2,
        w: 11.4,
        h: 1.15,
        fontSize: 16,
        color: palette.heading,
        fontFace: palette.fontBody,
        wrap: true,
      }
    );
    slide.addText("Apexon  |  Azure AI Foundry  |  Microsoft Fabric  |  Harness", {
      x: MARGIN,
      y: 6.2,
      w: 10,
      h: 0.3,
      fontSize: 12,
      color: "9AA6B8",
      fontFace: palette.fontBody,
    });
  }

  await pres.writeFile({ fileName: finalPath });
  return finalPath;
}
