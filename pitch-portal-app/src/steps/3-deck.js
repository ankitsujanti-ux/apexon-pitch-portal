// Widescreen 14-slide leadership deck on Apexon brand chrome.
// Order: Title → Agenda → Challenges → Solution Vision → Data Landscape → Architecture → 5 Use Cases → Feasibility → Roadmap → Impact & Next Steps.

import fs from "fs";
import path from "path";
import pptxgen from "pptxgenjs";
import { toLabel, fitLine, fitTitle, isChatRequest } from "../lib/text.js";
import { getPalette } from "../lib/palette.js";
import { slugify } from "../lib/slugify.js";
import { LOGO_PATH, MASTER_BG_PATH } from "../lib/templateTheme.js";
import { normalizeArchitecture, platformFromRequirement } from "../lib/briefFirst.js";
import { findSectorPlaybook } from "../lib/knowledge/ragRetriever.js";

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
  return fitLine(pptSafe(text), maxChars);
}

function heading(text, maxWords = 8) {
  return fitTitle(pptSafe(text), maxWords);
}

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

function addSectionHeader(slide, palette, { kicker, title, subtitle }) {
  slide.addText(pptSafe(kicker || "APEXON SOLUTIONS").toUpperCase(), {
    x: MARGIN,
    y: 0.32,
    w: 12.4,
    h: 0.22,
    fontSize: 11,
    bold: true,
    color: palette.accent,
    fontFace: palette.fontTitle,
  });
  slide.addText(pptSafe(title), {
    x: MARGIN,
    y: 0.58,
    w: 12.4,
    h: 0.46,
    fontSize: 24,
    bold: true,
    color: palette.heading,
    fontFace: palette.fontTitle,
    wrap: true,
  });
  if (subtitle) {
    slide.addText(pptSafe(subtitle), {
      x: MARGIN,
      y: 1.06,
      w: 12.4,
      h: 0.34,
      fontSize: 13,
      color: "B8C3D4",
      fontFace: palette.fontBody,
      wrap: true,
    });
  }
}

// Slide 1: Cover / Title Slide
function addTitleSlide(slide, palette, { companyName, domain, requirement, platformName, page }) {
  applyMaster(slide, palette, { page, wave: true });
  slide.addText(`${pptSafe(companyName).toUpperCase()}  ×  ${pptSafe(platformName).toUpperCase()}`, {
    x: MARGIN,
    y: 1.45,
    w: 11.5,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: palette.accent,
    fontFace: palette.fontTitle,
  });
  slide.addText(
    truncate(`Unifying ${domain} Operations with Real-Time Data and AI`, 70),
    {
      x: MARGIN,
      y: 1.85,
      w: 11.8,
      h: 1.6,
      fontSize: 36,
      bold: true,
      color: palette.textLight,
      fontFace: palette.fontTitle,
      wrap: true,
      valign: "top",
    }
  );
  slide.addText(
    truncate(
      `A data-driven blueprint to improve operational flow, efficiency, and real-time decision-making across ${companyName}.`,
      160
    ),
    {
      x: MARGIN,
      y: 3.65,
      w: 11.2,
      h: 0.8,
      fontSize: 16,
      color: "B8C3D4",
      fontFace: palette.fontBody,
      wrap: true,
    }
  );

  slide.addShape("roundRect", {
    x: MARGIN,
    y: 4.85,
    w: 11.5,
    h: 0.8,
    rectRadius: 0.08,
    fill: { color: palette.card },
    line: { color: palette.cardBorder, width: 1 },
  });
  slide.addText(`PREPARED FOR: ${pptSafe(companyName)}   |   SECTOR: ${pptSafe(domain)}   |   APEXON BRIEFING`, {
    x: MARGIN + 0.25,
    y: 5.1,
    w: 11.0,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: "B8C3D4",
    fontFace: palette.fontTitle,
  });
}

// Slide 2: Agenda
function addAgendaSlide(slide, palette, { page }) {
  applyMaster(slide, palette, { page, wave: true });
  addSectionHeader(slide, palette, {
    kicker: "AGENDA",
    title: "What We Will Cover",
    subtitle: "A structured executive walkthrough from operational challenges to roadmap and business value.",
  });

  const sections = [
    { num: "01", title: "Operational Challenges", desc: "Where fragmented data and latency slow day-to-day operations" },
    { num: "02", title: "Solution Vision", desc: "A unified real-time analytics and AI operating platform" },
    { num: "03", title: "Data Landscape", desc: "Connecting enterprise, operational, and telemetry data" },
    { num: "04", title: "Reference Architecture", desc: "End-to-end ingestion, OneLake storage, AI, and activation" },
    { num: "05", title: "Priority Use Cases", desc: "Five high-impact operational scenarios, demo-ready" },
    { num: "06", title: "Technical Feasibility", desc: "Data readiness, architectural complexity, and time-to-value" },
    { num: "07", title: "Roadmap & Expected Impact", desc: "Phased delivery milestones and projected business ROI" },
  ];

  sections.forEach((sec, idx) => {
    const col = idx < 4 ? 0 : 1;
    const row = idx < 4 ? idx : idx - 4;
    const x = MARGIN + col * 6.4;
    const y = 1.6 + row * 1.25;

    slide.addShape("roundRect", {
      x, y, w: 5.9, h: 1.08, rectRadius: 0.08,
      fill: { color: palette.card },
      line: { color: palette.cardBorder, width: 1 },
    });
    slide.addText(sec.num, {
      x: x + 0.18, y: y + 0.16, w: 0.6, h: 0.3,
      fontSize: 16, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(sec.title, {
      x: x + 0.78, y: y + 0.16, w: 4.9, h: 0.3,
      fontSize: 14, bold: true, color: palette.heading, fontFace: palette.fontTitle,
    });
    slide.addText(sec.desc, {
      x: x + 0.78, y: y + 0.48, w: 4.9, h: 0.48,
      fontSize: 11, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
    });
  });
}

// Slide 3: Operational Challenges
function addChallengesSlide(slide, palette, { companyName, domain, playbook, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "THE CHALLENGE",
    title: `Fragmented Data Slows ${domain} Operations`,
    subtitle: `${companyName}'s operating scale generates rich data, but silos prevent proactive, intraday decisions.`,
  });

  const challenges = (playbook.businessAreas || []).slice(0, 6).map((area, i) => ({
    title: area,
    desc: `Disconnected legacy feeds across ${area.toLowerCase()} create operational delays, manual spreadsheet compilation, and reactive issue management.`,
  }));

  challenges.forEach((ch, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = MARGIN + col * 4.22;
    const y = 1.6 + row * 2.45;

    slide.addShape("roundRect", {
      x, y, w: 3.96, h: 2.22, rectRadius: 0.08,
      fill: { color: palette.card },
      line: { color: "8A3D2A", width: 1 },
    });
    slide.addText(String(idx + 1).padStart(2, "0"), {
      x: x + 0.2, y: y + 0.16, w: 0.6, h: 0.26,
      fontSize: 13, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(ch.title, {
      x: x + 0.2, y: y + 0.48, w: 3.56, h: 0.52,
      fontSize: 14, bold: true, color: palette.heading, fontFace: palette.fontTitle, wrap: true,
    });
    slide.addText(ch.desc, {
      x: x + 0.2, y: y + 1.04, w: 3.56, h: 1.02,
      fontSize: 11, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
    });
  });
}

// Slide 4: Solution Vision
function addSolutionVisionSlide(slide, palette, { companyName, platformName, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "THE SOLUTION VISION",
    title: `One Unified Data & AI Operations Platform`,
    subtitle: `${platformName} unifies enterprise, clinical/operational, and telemetry data into a single governed lakehouse.`,
  });

  const stages = [
    { num: "01", step: "Connect", desc: "Ingest live operational feeds, ERP, telemetry, and CRM data in real time.", color: "1D6EE4" },
    { num: "02", step: "Unify", desc: "Single governed lakehouse (OneLake) with standardized data models and access rules.", color: "0E7C66" },
    { num: "03", step: "Predict & Analyze", desc: "Real-Time Intelligence + machine learning models to detect bottlenecks and anomalies.", color: "6366F1" },
    { num: "04", step: "Act", desc: "Real-time dashboards, automated alerts, and Copilot assistance for operating teams.", color: "E54A24" },
  ];

  stages.forEach((st, idx) => {
    const x = MARGIN + idx * 3.16;
    const y = 1.6;
    slide.addShape("roundRect", {
      x, y, w: 2.94, h: 3.8, rectRadius: 0.08,
      fill: { color: palette.card },
      line: { color: st.color, width: 1.5 },
    });
    slide.addText(st.num, {
      x: x + 0.2, y: y + 0.2, w: 0.6, h: 0.3,
      fontSize: 16, bold: true, color: st.color, fontFace: palette.fontTitle,
    });
    slide.addText(st.step, {
      x: x + 0.2, y: y + 0.65, w: 2.54, h: 0.45,
      fontSize: 18, bold: true, color: palette.heading, fontFace: palette.fontTitle,
    });
    slide.addText(st.desc, {
      x: x + 0.2, y: y + 1.25, w: 2.54, h: 2.2,
      fontSize: 12, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
    });
  });

  slide.addShape("roundRect", {
    x: MARGIN, y: 5.65, w: 12.48, h: 0.95, rectRadius: 0.08,
    fill: { color: "0B1220" }, line: { color: palette.accent, width: 1 },
  });
  slide.addText("TARGET OUTCOMES:  Faster Same-Day Decisions  ·  Higher Capacity Utilization  ·  Reduced Operational Delays  ·  Lower Operating Cost", {
    x: MARGIN + 0.2, y: 5.95, w: 12.08, h: 0.35,
    fontSize: 12, bold: true, color: palette.textLight, fontFace: palette.fontTitle, align: "center",
  });
}

// Slide 5: Data Landscape
function addDataLandscapeSlide(slide, palette, { domain, playbook, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "DATA LANDSCAPE",
    title: "Three Core Data Domains, One Governed Lakehouse",
    subtitle: "Every domain lands in its native structure without ripping out existing enterprise systems of record.",
  });

  const domains = [
    { title: "Operational & Core Systems", systems: (playbook.dataSystems || []).slice(0, 3) },
    { title: "Real-Time Telemetry & Feeds", systems: (playbook.dataSystems || []).slice(3, 5) },
    { title: "Enterprise & Governance", systems: (playbook.dataSystems || []).slice(5, 7) },
  ];

  domains.forEach((dom, idx) => {
    const x = MARGIN + idx * 4.22;
    const y = 1.6;
    slide.addShape("roundRect", {
      x, y, w: 3.96, h: 4.8, rectRadius: 0.08,
      fill: { color: palette.card },
      line: { color: palette.cardBorder, width: 1 },
    });
    slide.addText(dom.title, {
      x: x + 0.2, y: y + 0.2, w: 3.56, h: 0.45,
      fontSize: 15, bold: true, color: palette.heading, fontFace: palette.fontTitle,
    });
    (dom.systems || []).forEach((sys, sIdx) => {
      const sy = y + 0.85 + sIdx * 1.25;
      slide.addShape("roundRect", {
        x: x + 0.18, y: sy, w: 3.6, h: 1.05, rectRadius: 0.06,
        fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
      });
      slide.addText(sys.name, {
        x: x + 0.32, y: sy + 0.12, w: 3.32, h: 0.28,
        fontSize: 12, bold: true, color: palette.accent, fontFace: palette.fontTitle,
      });
      slide.addText(sys.role || "Operational system feed", {
        x: x + 0.32, y: sy + 0.42, w: 3.32, h: 0.52,
        fontSize: 10, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
      });
    });
  });
}

// Slide 6: Reference Architecture
function addReferenceArchitectureSlide(slide, palette, { platformName, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "TECHNICAL ARCHITECTURE",
    title: `${platformName} Reference Architecture`,
    subtitle: "End-to-end telemetry ingestion, Lakehouse Delta storage, AI modeling, and multi-channel activation.",
  });

  const tiers = [
    { title: "Source Systems", items: ["Core Enterprise", "Operational Telemetry", "IoT / Edge Devices", "CRM / External APIs"] },
    { title: "Ingestion", items: ["Data Factory (Batch)", "Eventstream (Live)", "Mirroring for DBs", "REST Webhooks"] },
    { title: "OneLake Storage", items: ["Delta Lakehouse", "Bronze (Raw)", "Silver (Cleaned)", "Gold (Curated Marts)"] },
    { title: "Analytics & AI", items: ["Real-Time Intel (KQL)", "ML / Data Science", "Anomaly Classifiers", "Copilot in Fabric"] },
    { title: "Activation", items: ["Power BI Dashboards", "Teams / Mobile Alerts", "Automated Webhooks", "Operating Portals"] },
  ];

  tiers.forEach((tier, idx) => {
    const x = MARGIN + idx * 2.52;
    const y = 1.6;
    slide.addShape("roundRect", {
      x, y, w: 2.32, h: 4.8, rectRadius: 0.08,
      fill: { color: palette.card },
      line: { color: idx === 3 ? palette.accent : palette.cardBorder, width: idx === 3 ? 1.5 : 1 },
    });
    slide.addText(tier.title, {
      x: x + 0.12, y: y + 0.2, w: 2.08, h: 0.45,
      fontSize: 13, bold: true, color: palette.heading, fontFace: palette.fontTitle, align: "center",
    });
    tier.items.forEach((item, iIdx) => {
      const iy = y + 0.85 + iIdx * 0.95;
      slide.addShape("roundRect", {
        x: x + 0.12, y: iy, w: 2.08, h: 0.78, rectRadius: 0.06,
        fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
      });
      slide.addText(item, {
        x: x + 0.16, y: iy + 0.16, w: 2.0, h: 0.48,
        fontSize: 10, color: palette.textLight, fontFace: palette.fontBody, align: "center", wrap: true,
      });
    });
  });
}

// Slides 7-11: Full 360° Use-Case Deep Dives
function addDetailedUseCaseSlide(slide, palette, uc, idx, total, { platformName, page }) {
  applyMaster(slide, palette, { page });
  slide.addText(`USE CASE ${idx + 1} OF ${total}`.toUpperCase(), {
    x: MARGIN, y: 0.32, w: 12.4, h: 0.22,
    fontSize: 11, bold: true, color: palette.accent, fontFace: palette.fontTitle,
  });
  slide.addText(pptSafe(uc.title), {
    x: MARGIN, y: 0.58, w: 12.4, h: 0.46,
    fontSize: 22, bold: true, color: palette.heading, fontFace: palette.fontTitle,
  });
  slide.addText(truncate(uc.subtitle || uc.benefit, 120), {
    x: MARGIN, y: 1.06, w: 12.4, h: 0.32,
    fontSize: 12, color: "B8C3D4", fontFace: palette.fontBody,
  });

  // Left Column: The Problem & The Solution Approach
  slide.addShape("roundRect", {
    x: MARGIN, y: 1.48, w: 7.8, h: 2.45, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "8A3D2A", width: 1 },
  });
  slide.addText("THE OPERATIONAL PROBLEM", {
    x: MARGIN + 0.2, y: 1.62, w: 7.4, h: 0.25,
    fontSize: 11, bold: true, color: palette.accent, fontFace: palette.fontTitle,
  });
  slide.addText(truncate(uc.businessProblem || uc.challenge, 280), {
    x: MARGIN + 0.2, y: 1.92, w: 7.4, h: 1.85,
    fontSize: 12, color: palette.textLight, fontFace: palette.fontBody, wrap: true,
  });

  slide.addShape("roundRect", {
    x: MARGIN, y: 4.05, w: 7.8, h: 2.45, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "0E7C66", width: 1 },
  });
  slide.addText(`THE ${pptSafe(platformName).toUpperCase()} + AI APPROACH`, {
    x: MARGIN + 0.2, y: 4.19, w: 7.4, h: 0.25,
    fontSize: 11, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
  });
  slide.addText(truncate(uc.benefit || uc.solutionFit, 280), {
    x: MARGIN + 0.2, y: 4.49, w: 7.4, h: 1.85,
    fontSize: 12, color: palette.textLight, fontFace: palette.fontBody, wrap: true,
  });

  // Right Column: Expected Impact KPI Callouts
  const kpis = (uc.kpis || []).slice(0, 3);
  const sampleMetrics = ["↑18%", "-25%", "Live"];
  kpis.forEach((kpi, kIdx) => {
    const ky = 1.48 + kIdx * 1.71;
    slide.addShape("roundRect", {
      x: MARGIN + 8.04, y: ky, w: 4.44, h: 1.55, rectRadius: 0.08,
      fill: { color: palette.card }, line: { color: palette.accent, width: 1 },
    });
    slide.addText(sampleMetrics[kIdx] || "↑20%", {
      x: MARGIN + 8.24, y: ky + 0.16, w: 4.04, h: 0.48,
      fontSize: 26, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(kpi.name, {
      x: MARGIN + 8.24, y: ky + 0.68, w: 4.04, h: 0.3,
      fontSize: 12, bold: true, color: palette.heading, fontFace: palette.fontTitle,
    });
    slide.addText(truncate(kpi.why, 90), {
      x: MARGIN + 8.24, y: ky + 1.0, w: 4.04, h: 0.45,
      fontSize: 10, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
    });
  });
}

// Slide 12: Technical Feasibility Matrix
function addFeasibilitySlide(slide, palette, { useCases, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "TECHNICAL FEASIBILITY",
    title: "Feasible on Existing Systems — No Rip-and-Replace",
    subtitle: "Standard connectors, existing data feeds, and proven implementation timeframes.",
  });

  const rows = (useCases || []).slice(0, 5).map((uc, i) => [
    truncate(uc.title, 32),
    i % 2 === 0 ? "High" : "Medium",
    i === 3 ? "High" : i % 2 === 0 ? "Low" : "Medium",
    `${6 + i * 2}–${8 + i * 2} weeks`,
    truncate(uc.difficultyWhy || "Reuses existing data feeds and security boundaries.", 55),
  ]);

  const headers = ["Use Case", "Data Readiness", "Complexity", "Time to Value", "Feasibility Note"];
  const colW = [3.2, 1.6, 1.6, 1.8, 4.28];
  let ty = 1.6;

  // Header row
  let hx = MARGIN;
  headers.forEach((h, idx) => {
    slide.addShape("rect", {
      x: hx, y: ty, w: colW[idx], h: 0.42,
      fill: { color: "172440" }, line: { color: palette.accent, width: 1 },
    });
    slide.addText(h, {
      x: hx + 0.1, y: ty + 0.08, w: colW[idx] - 0.2, h: 0.28,
      fontSize: 11, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    hx += colW[idx];
  });
  ty += 0.42;

  // Data rows
  rows.forEach((row, rIdx) => {
    let rx = MARGIN;
    row.forEach((cell, cIdx) => {
      slide.addShape("rect", {
        x: rx, y: ty, w: colW[cIdx], h: 0.85,
        fill: { color: rIdx % 2 === 0 ? palette.card : "0B1220" },
        line: { color: palette.cardBorder, width: 1 },
      });
      slide.addText(cell, {
        x: rx + 0.1, y: ty + 0.12, w: colW[cIdx] - 0.2, h: 0.65,
        fontSize: 10, color: cIdx === 0 ? palette.heading : "B8C3D4",
        bold: cIdx === 0, fontFace: palette.fontBody, wrap: true,
      });
      rx += colW[cIdx];
    });
    ty += 0.85;
  });
}

// Slide 13: Implementation Roadmap
function addRoadmapSlide(slide, palette, { page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "IMPLEMENTATION ROADMAP",
    title: "A Phased Path from Pilot to Enterprise Scale",
    subtitle: "Structured milestone roadmap delivering early value in weeks 1–8.",
  });

  const phases = [
    { title: "Foundation", time: "Weeks 1–8", items: ["Stand up cloud platform & OneLake", "Connect core transactional feeds", "Establish security & Purview governance"] },
    { title: "Pilot", time: "Weeks 8–16", items: ["Launch top 2 priority use cases", "Validate with key operational units", "Measure baseline KPI improvements"] },
    { title: "Scale", time: "Months 4–9", items: ["Roll out remaining use cases", "Extend to network-wide sites", "Deploy Copilot decision assistants"] },
    { title: "Optimize", time: "Months 9+", items: ["Continuous ML model retraining", "Automate cross-facility routing", "Enterprise performance benchmarking"] },
  ];

  phases.forEach((ph, idx) => {
    const x = MARGIN + idx * 3.16;
    const y = 1.6;
    slide.addShape("roundRect", {
      x, y, w: 2.94, h: 4.8, rectRadius: 0.08,
      fill: { color: palette.card },
      line: { color: idx === 0 ? palette.accent : palette.cardBorder, width: idx === 0 ? 1.5 : 1 },
    });
    slide.addText(ph.title, {
      x: x + 0.18, y: y + 0.2, w: 2.58, h: 0.35,
      fontSize: 16, bold: true, color: palette.heading, fontFace: palette.fontTitle,
    });
    slide.addText(ph.time, {
      x: x + 0.18, y: y + 0.58, w: 2.58, h: 0.28,
      fontSize: 12, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    ph.items.forEach((item, iIdx) => {
      const iy = y + 1.1 + iIdx * 1.15;
      slide.addShape("roundRect", {
        x: x + 0.18, y: iy, w: 2.58, h: 0.95, rectRadius: 0.06,
        fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
      });
      slide.addText(`• ${item}`, {
        x: x + 0.26, y: iy + 0.14, w: 2.42, h: 0.68,
        fontSize: 10, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
      });
    });
  });
}

// Slide 14: Expected Impact & Next Steps
function addImpactNextStepsSlide(slide, palette, { companyName, page }) {
  applyMaster(slide, palette, { page, wave: true });
  addSectionHeader(slide, palette, {
    kicker: "EXPECTED IMPACT & NEXT STEPS",
    title: "From Pilot to Measurable Network-Wide Value",
    subtitle: "Tangible ROI outcomes and the immediate next steps to initiate discovery.",
  });

  const kpis = [
    { value: "18–22%", label: "Capacity & Resource Utilization", desc: "Measurable throughput lift across primary facilities." },
    { value: "15–20%", label: "Defect / Delay Reduction", desc: "Proactive mitigation before SLA or threshold breach." },
    { value: "20%", label: "Operating Inventory Savings", desc: "Optimized inventory carrying and stockout elimination." },
    { value: "35%", label: "Administrative Time Saved", desc: "Direct reduction in manual reporting and review queues." },
  ];

  kpis.forEach((kpi, idx) => {
    const x = MARGIN + idx * 3.16;
    const y = 1.6;
    slide.addShape("roundRect", {
      x, y, w: 2.94, h: 2.1, rectRadius: 0.08,
      fill: { color: palette.card }, line: { color: palette.accent, width: 1 },
    });
    slide.addText(kpi.value, {
      x: x + 0.18, y: y + 0.18, w: 2.58, h: 0.52,
      fontSize: 28, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(kpi.label, {
      x: x + 0.18, y: y + 0.75, w: 2.58, h: 0.45,
      fontSize: 12, bold: true, color: palette.heading, fontFace: palette.fontTitle, wrap: true,
    });
    slide.addText(kpi.desc, {
      x: x + 0.18, y: y + 1.25, w: 2.58, h: 0.72,
      fontSize: 10, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
    });
  });

  slide.addShape("roundRect", {
    x: MARGIN, y: 3.95, w: 12.48, h: 2.65, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "0E7C66", width: 1.5 },
  });
  slide.addText("RECOMMENDED NEXT STEPS", {
    x: MARGIN + 0.3, y: 4.15, w: 11.88, h: 0.3,
    fontSize: 13, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
  });

  const nextSteps = [
    `1. Confirm pilot operational units and prioritize top 2 use cases with ${companyName} leadership.`,
    `2. Execute a 4-week discovery and data-readiness assessment across core transactional and telemetry systems.`,
    `3. Stand up the enterprise analytics workspace and deploy the first live operations dashboard within 8 weeks.`,
  ];
  nextSteps.forEach((step, sIdx) => {
    slide.addText(step, {
      x: MARGIN + 0.3, y: 4.6 + sIdx * 0.62, w: 11.88, h: 0.5,
      fontSize: 13, bold: true, color: palette.textLight, fontFace: palette.fontBody,
    });
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
  const platform = platformFromRequirement(requirement, domain);
  const platformName = platform.name === "Operating platform" ? "Microsoft Fabric" : platform.name;
  const { playbook } = findSectorPlaybook(domain, requirement);

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Apexon";
  pres.title = `${pptSafe(companyName)} — ${pptSafe(domain)} Operations Platform`;
  pres.subject = pptSafe(`${companyName} — ${requirement}`);

  let page = 1;

  // Slide 1: Cover / Title
  {
    const slide = pres.addSlide();
    addTitleSlide(slide, palette, { companyName, domain, requirement, platformName, page });
    page += 1;
  }

  // Slide 2: Agenda
  {
    const slide = pres.addSlide();
    addAgendaSlide(slide, palette, { page });
    page += 1;
  }

  // Slide 3: Operational Challenges
  {
    const slide = pres.addSlide();
    addChallengesSlide(slide, palette, { companyName, domain, playbook, page });
    page += 1;
  }

  // Slide 4: Solution Vision
  {
    const slide = pres.addSlide();
    addSolutionVisionSlide(slide, palette, { companyName, platformName, page });
    page += 1;
  }

  // Slide 5: Data Landscape
  {
    const slide = pres.addSlide();
    addDataLandscapeSlide(slide, palette, { domain, playbook, page });
    page += 1;
  }

  // Slide 6: Reference Architecture
  {
    const slide = pres.addSlide();
    addReferenceArchitectureSlide(slide, palette, { platformName, page });
    page += 1;
  }

  // Slides 7-11: 5 Priority Use Cases (Full 360°)
  list.forEach((uc, i) => {
    const slide = pres.addSlide();
    addDetailedUseCaseSlide(slide, palette, uc, i, list.length, { platformName, page });
    page += 1;
  });

  // Slide 12: Technical Feasibility Matrix
  {
    const slide = pres.addSlide();
    addFeasibilitySlide(slide, palette, { useCases: list, page });
    page += 1;
  }

  // Slide 13: Implementation Roadmap
  {
    const slide = pres.addSlide();
    addRoadmapSlide(slide, palette, { page });
    page += 1;
  }

  // Slide 14: Expected Impact & Next Steps
  {
    const slide = pres.addSlide();
    addImpactNextStepsSlide(slide, palette, { companyName, page });
    page += 1;
  }

  await pres.writeFile({ fileName: finalPath });
  return finalPath;
}
