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
    truncate(`Transforming ${domain} Operations with Real-Time Data & AI`, 70),
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
      `A strategic blueprint for ${companyName} leadership to eliminate operational delays, connect daily systems, and empower frontline teams with real-time intelligence.`,
      170
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
  slide.addText(`PREPARED FOR: ${pptSafe(companyName)}   |   SECTOR: ${pptSafe(domain)}   |   EXECUTIVE BRIEFING`, {
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
function addAgendaSlide(slide, palette, { domain, playbook, page }) {
  applyMaster(slide, palette, { page, wave: true });
  addSectionHeader(slide, palette, {
    kicker: "EXECUTIVE AGENDA",
    title: "What We Will Cover Today",
    subtitle: `A structured executive walkthrough tailored to ${domain} operations and measurable business ROI.`,
  });

  const areas = (playbook.businessAreas || []).slice(0, 3).join(", ");
  const sections = [
    { num: "01", title: "Operational Challenges", desc: `Where data silos and latency slow daily decisions across ${areas.toLowerCase()}` },
    { num: "02", title: "Solution Vision", desc: "How a unified data platform connects teams and speeds up workflows" },
    { num: "03", title: "Data Landscape", desc: "Connecting your existing systems without replacing what already works" },
    { num: "04", title: "Architecture Overview", desc: "A simple, secure, and governed roadmap for enterprise AI" },
    { num: "05", title: "Priority Use Cases", desc: "Five high-impact business scenarios with clear operational payoffs" },
    { num: "06", title: "Feasibility Assessment", desc: "Why this is achievable quickly using existing enterprise data" },
    { num: "07", title: "Roadmap & Expected Value", desc: "Phased delivery timeline and measurable business return on investment" },
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
    kicker: "CURRENT OPERATIONAL CHALLENGES",
    title: `Siloed Data Slows Down ${domain} Operations`,
    subtitle: `${companyName} generates valuable operational signals every minute, but disconnected tools force staff into reactive firefighting.`,
  });

  const challenges = (playbook.businessAreas || []).slice(0, 6).map((area, i) => ({
    title: area,
    desc: `Disconnected information across ${area.toLowerCase()} forces staff into manual spreadsheet checks, creating operational blind spots and delayed response times.`,
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
function addSolutionVisionSlide(slide, palette, { companyName, domain, playbook, platformName, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "THE SOLUTION VISION",
    title: `One Unified ${domain} Data & AI Operations Platform`,
    subtitle: `${platformName} connects daily operational systems into a single, real-time operating hub for ${companyName}.`,
  });

  const stages = [
    { num: "01", step: "Connect", desc: `Securely link existing core systems, transactional feeds, and frontline telemetry without disrupting daily operations.`, color: "1D6EE4" },
    { num: "02", step: "Unify", desc: `Organize all ${domain.toLowerCase()} data into one trusted single source of truth that every department can rely on.`, color: "0E7C66" },
    { num: "03", step: "Predict", desc: `Apply smart pattern recognition and AI models to detect bottlenecks and anomalies hours before they impact the business.`, color: "6366F1" },
    { num: "04", step: "Empower & Act", desc: `Deliver clear visual dashboards, instant mobile alerts, and AI assistants directly to frontline operating leads.`, color: "E54A24" },
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

  // Dynamic domain outcomes
  const outcomes = (playbook.commonKpis || []).slice(0, 4).map(k => k.name).join("  ·  ");
  slide.addShape("roundRect", {
    x: MARGIN, y: 5.65, w: 12.48, h: 0.95, rectRadius: 0.08,
    fill: { color: "0B1220" }, line: { color: palette.accent, width: 1 },
  });
  slide.addText(`TARGET OUTCOMES:  ${outcomes || "Faster Same-Day Decisions  ·  Higher Operational Output  ·  Fewer Manual Errors  ·  Lower Operating Costs"}`, {
    x: MARGIN + 0.2, y: 5.95, w: 12.08, h: 0.35,
    fontSize: 11, bold: true, color: palette.textLight, fontFace: palette.fontTitle, align: "center",
  });
}

// Slide 5: Data Landscape
function addDataLandscapeSlide(slide, palette, { domain, playbook, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "CONNECTED DATA LANDSCAPE",
    title: "Bringing Your Systems Together Without Disruption",
    subtitle: `Every ${domain.toLowerCase()} system connects seamlessly without ripping out or replacing your current enterprise software.`,
  });

  const domains = [
    { title: "Core Systems of Record", desc: "Existing operational databases & transactional history", systems: (playbook.dataSystems || []).slice(0, 3) },
    { title: "Live Activity & Feeds", desc: "Real-time updates, event streams & location signals", systems: (playbook.dataSystems || []).slice(3, 5) },
    { title: "Enterprise & Governance", desc: "Security rules, compliance logs & business reporting", systems: (playbook.dataSystems || []).slice(5, 7) },
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
      x: x + 0.2, y: y + 0.2, w: 3.56, h: 0.35,
      fontSize: 15, bold: true, color: palette.heading, fontFace: palette.fontTitle,
    });
    slide.addText(dom.desc, {
      x: x + 0.2, y: y + 0.52, w: 3.56, h: 0.28,
      fontSize: 10, color: "B8C3D4", fontFace: palette.fontBody,
    });
    (dom.systems || []).forEach((sys, sIdx) => {
      const sy = y + 0.88 + sIdx * 1.25;
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
function addReferenceArchitectureSlide(slide, palette, { domain, playbook, platformName, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "ARCHITECTURE OVERVIEW",
    title: `How the ${platformName} Platform Works for ${domain}`,
    subtitle: `A secure, end-to-end flow from your existing ${domain.toLowerCase()} systems to real-time decision dashboards.`,
  });

  const sourceItems = (playbook.dataSystems || []).slice(0, 4).map(s => truncate(s.name, 26));
  const activationItems = [
    `${domain} Operations Hub`,
    "Instant Alert Routing",
    "Automated Workflows",
    "AI Decision Copilot"
  ];

  const tiers = [
    { title: "1. Existing Systems", items: sourceItems.length ? sourceItems : ["Core Enterprise ERP", "Daily Operations", "Frontline Scans/Devices", "Partner & Web APIs"] },
    { title: "2. Fast Ingestion", items: ["Scheduled Batch", "Real-Time Streaming", "Direct Database Links", "Secure Webhooks"] },
    { title: "3. Unified Hub", items: ["Single Source of Truth", "Cleaned & Standardized", "Governed Lakehouse", "Role-Based Access"] },
    { title: "4. Smart AI & Radar", items: ["Live Anomaly Radar", "Predictive Analytics", "Bottleneck Classifiers", "AI Copilot Assistant"] },
    { title: "5. Frontline Action", items: activationItems },
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

// Slides 7-11: Detailed 360° Use Case
function addDetailedUseCaseSlide(slide, palette, uc, idx, total, { platformName, page }) {
  applyMaster(slide, palette, { page });
  
  const title = uc.title || `Priority Operational Use Case ${idx + 1}`;
  const summary = uc.summary || uc.description || "Streamlining core daily operations through real-time predictive analytics and automated workflows.";
  const problem = uc.businessProblem || uc.problem || "Fragmented systems create manual coordination delays, high operational overhead, and blind spots during peak periods.";
  const solution = uc.proposedSolution || uc.solution || `The ${platformName} platform unifies operational feeds, continuously runs predictive models, and triggers real-time alerts to frontline decision makers.`;
  
  // Extract or synthesize 3 domain-accurate KPIs
  const rawKpis = Array.isArray(uc.kpis) && uc.kpis.length > 0 ? uc.kpis : [];
  const kpiCards = [
    {
      metric: rawKpis[0]?.target || rawKpis[0]?.value || "25–35%",
      label: rawKpis[0]?.name || "Operational Velocity Lift",
      detail: rawKpis[0]?.impact || "Accelerates daily cycle times and eliminates handoff bottlenecks across teams.",
    },
    {
      metric: rawKpis[1]?.target || rawKpis[1]?.value || "15–20%",
      label: rawKpis[1]?.name || "Cost & Waste Reduction",
      detail: rawKpis[1]?.impact || "Minimizes manual rework, idle capacity, and operational leakages.",
    },
    {
      metric: rawKpis[2]?.target || rawKpis[2]?.value || "Real-Time",
      label: rawKpis[2]?.name || "Decision Speed & Visibility",
      detail: rawKpis[2]?.impact || "Provides instant situational awareness and proactive alerts before SLAs breach.",
    },
  ];

  addSectionHeader(slide, palette, {
    kicker: `USE CASE ${idx + 1} OF ${total}  |  OPERATIONAL FOCUS`,
    title: truncate(title, 55),
    subtitle: truncate(summary, 120),
  });

  // Top Left: The Business Problem (w: 6.1)
  const leftX = MARGIN;
  slide.addShape("roundRect", {
    x: leftX, y: 1.6, w: 6.1, h: 2.3, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "E54A24", width: 1.5 },
  });
  slide.addText("THE OPERATIONAL CHALLENGE", {
    x: leftX + 0.25, y: 1.8, w: 5.6, h: 0.28,
    fontSize: 12, bold: true, color: "FF7A59", fontFace: palette.fontTitle,
  });
  slide.addText(problem, {
    x: leftX + 0.25, y: 2.15, w: 5.6, h: 1.6,
    fontSize: 11, color: "E2E8F0", fontFace: palette.fontBody, wrap: true,
  });

  // Top Right: The Platform Solution (w: 6.18)
  const rightX = MARGIN + 6.3;
  slide.addShape("roundRect", {
    x: rightX, y: 1.6, w: 6.18, h: 2.3, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "0E7C66", width: 1.5 },
  });
  slide.addText("THE PLATFORM SOLUTION", {
    x: rightX + 0.25, y: 1.8, w: 5.68, h: 0.28,
    fontSize: 12, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
  });
  slide.addText(solution, {
    x: rightX + 0.25, y: 2.15, w: 5.68, h: 1.6,
    fontSize: 11, color: "E2E8F0", fontFace: palette.fontBody, wrap: true,
  });

  // Bottom: 3 KPI / Business Impact Cards
  kpiCards.forEach((kpi, kIdx) => {
    const kx = MARGIN + kIdx * 4.22;
    const ky = 4.05;
    slide.addShape("roundRect", {
      x: kx, y: ky, w: 4.04, h: 2.45, rectRadius: 0.08,
      fill: { color: palette.card }, line: { color: palette.cardBorder, width: 1 },
    });
    slide.addText(kpi.metric, {
      x: kx + 0.2, y: ky + 0.2, w: 3.64, h: 0.45,
      fontSize: 26, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(kpi.label, {
      x: kx + 0.2, y: ky + 0.72, w: 3.64, h: 0.35,
      fontSize: 12, bold: true, color: palette.heading, fontFace: palette.fontTitle, wrap: true,
    });
    slide.addText(kpi.detail, {
      x: kx + 0.2, y: ky + 1.12, w: 3.64, h: 1.15,
      fontSize: 10, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
    });
  });
}

// Slide 12: Technical Feasibility Matrix
function addFeasibilitySlide(slide, palette, { useCases, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "DELIVERY FEASIBILITY",
    title: "Fast-Track Implementation Readiness",
    subtitle: "Every priority use case connects to pre-existing enterprise data feeds with low integration complexity.",
  });

  const headers = ["Priority Use Case", "Primary Data Feeds Required", "Integration Effort", "Time-to-Value"];
  const colWidths = [3.8, 4.4, 2.1, 2.18];
  
  // Header Row
  let curX = MARGIN;
  headers.forEach((h, i) => {
    slide.addShape("roundRect", {
      x: curX, y: 1.6, w: colWidths[i], h: 0.45, rectRadius: 0.04,
      fill: { color: "131F37" }, line: { color: palette.cardBorder, width: 1 },
    });
    slide.addText(h, {
      x: curX + 0.1, y: 1.68, w: colWidths[i] - 0.2, h: 0.3,
      fontSize: 11, bold: true, color: palette.heading, fontFace: palette.fontTitle,
    });
    curX += colWidths[i] + 0.05;
  });

  // Data Rows
  (useCases || []).slice(0, 5).forEach((uc, rIdx) => {
    const ry = 2.15 + rIdx * 0.88;
    const title = truncate(uc.title || `Use Case ${rIdx + 1}`, 36);
    const dataReq = Array.isArray(uc.dataRequirements) ? uc.dataRequirements.slice(0, 2).join(", ") : (uc.feasibility || "Core database feeds, real-time events, ERP records");
    const effort = rIdx < 2 ? "Low (Standard API)" : "Moderate (Batch + Stream)";
    const ttv = rIdx === 0 ? "4–6 Weeks" : rIdx < 3 ? "6–10 Weeks" : "10–14 Weeks";

    const rowCols = [title, truncate(dataReq, 48), effort, ttv];
    curX = MARGIN;
    rowCols.forEach((val, cIdx) => {
      slide.addShape("roundRect", {
        x: curX, y: ry, w: colWidths[cIdx], h: 0.8, rectRadius: 0.04,
        fill: { color: palette.card }, line: { color: palette.cardBorder, width: 1 },
      });
      slide.addText(val, {
        x: curX + 0.1, y: ry + 0.15, w: colWidths[cIdx] - 0.2, h: 0.5,
        fontSize: cIdx === 0 ? 11 : 10,
        bold: cIdx === 0 || cIdx === 3,
        color: cIdx === 0 ? palette.heading : cIdx === 2 ? "7DDEA0" : cIdx === 3 ? palette.accent : "B8C3D4",
        fontFace: palette.fontBody,
        wrap: true,
      });
      curX += colWidths[cIdx] + 0.05;
    });
  });
}

// Slide 13: Implementation Roadmap
function addRoadmapSlide(slide, palette, { domain, useCases, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "DELIVERY ROADMAP",
    title: "A Phased Path from Fast Pilot to Enterprise Scale",
    subtitle: `A structured milestone plan delivering measurable value across ${domain.toLowerCase()} operations within 8 weeks.`,
  });

  const topUc = (useCases || [])[0]?.title ? truncate(useCases[0].title.split(/\s+[-—–]\s+|—|–/)[0].trim(), 32) : "Priority Use Case";
  const secondUc = (useCases || [])[1]?.title ? truncate(useCases[1].title.split(/\s+[-—–]\s+|—|–/)[0].trim(), 32) : "Secondary Use Case";

  const phases = [
    { title: "1. Setup & Foundation", time: "Weeks 1–8", items: ["Stand up secure cloud workspace", "Connect top 2 primary data feeds", "Establish user access & security rules"] },
    { title: "2. Quick-Win Pilot", time: "Weeks 8–16", items: [`Launch live ${topUc}`, "Validate with pilot operating team", "Measure baseline time & cost savings"] },
    { title: "3. Enterprise Rollout", time: "Months 4–9", items: [`Deploy ${secondUc} & remaining use cases`, "Roll out across all operating locations", "Enable mobile alerts & AI assistants"] },
    { title: "4. Continuous Value", time: "Months 9+", items: ["Fine-tune prediction models", "Automate cross-department workflows", "Benchmark network-wide ROI"] },
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
      fontSize: 15, bold: true, color: palette.heading, fontFace: palette.fontTitle,
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
function addImpactNextStepsSlide(slide, palette, { companyName, domain, playbook, page }) {
  applyMaster(slide, palette, { page, wave: true });
  addSectionHeader(slide, palette, {
    kicker: "EXPECTED BUSINESS VALUE",
    title: `Measurable ROI & Next Steps for ${companyName}`,
    subtitle: `Projected operational outcomes tailored to ${domain} and the immediate next steps to initiate discovery.`,
  });

  const playbookKpis = (playbook.commonKpis || []).slice(0, 4);
  const sampleValues = ["20–30%", "15–25%", "-35%", "Live"];
  
  const kpis = playbookKpis.length >= 4 ? playbookKpis.map((k, i) => ({
    value: sampleValues[i] || "↑20%",
    label: truncate(k.name, 28),
    desc: truncate(k.why, 85),
  })) : [
    { value: "18–25%", label: "Operational Throughput Lift", desc: "Faster task turnaround and fewer idle bottlenecks across core units." },
    { value: "20–30%", label: "Delay & Error Reduction", desc: "Catching exceptions early before customer SLAs or costs are breached." },
    { value: "15–20%", label: "Operating Cost Savings", desc: "Less rework, reduced inventory carrying costs, and lower overtime." },
    { value: "35%+", label: "Staff Time Saved", desc: "Substantial reduction in manual spreadsheet compilation and status tracking." },
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
  slide.addText("RECOMMENDED IMMEDIATE NEXT STEPS", {
    x: MARGIN + 0.3, y: 4.15, w: 11.88, h: 0.3,
    fontSize: 13, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
  });

  const nextSteps = [
    `1. Prioritize top 2 quick-win use cases with ${companyName} leadership and identify the pilot operating unit.`,
    `2. Complete a streamlined 3-week discovery review of your existing data sources and security boundaries.`,
    `3. Deploy the first live operational radar dashboard within 8 weeks to demonstrate real-world ROI.`,
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
    addAgendaSlide(slide, palette, { domain, playbook, page });
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
    addSolutionVisionSlide(slide, palette, { companyName, domain, playbook, platformName, page });
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
    addReferenceArchitectureSlide(slide, palette, { domain, playbook, platformName, page });
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
    addRoadmapSlide(slide, palette, { domain, useCases: list, page });
    page += 1;
  }

  // Slide 14: Expected Impact & Next Steps
  {
    const slide = pres.addSlide();
    addImpactNextStepsSlide(slide, palette, { companyName, domain, playbook, page });
    page += 1;
  }

  await pres.writeFile({ fileName: finalPath });
  return finalPath;
}
