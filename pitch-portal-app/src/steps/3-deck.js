// 3-deck.js — 14-Slide 100% Dynamic Domain & Use-Case-Centric Executive Deck on Apexon Brand Chrome
// Structure: Title → Agenda → Challenges → Solution Vision → Data Foundation → Architecture →
// Command Center → Explainable AI Breakdown → Behavioral Profiling → Investigation Queue → Business Outcomes →
// Data Readiness Matrix → Delivery Roadmap → Next Steps.
// Zero hardcoded domain strings and zero forced vendor branding — tailored to the client, sector, and requirement.

import fs from "fs";
import path from "path";
import pptxgen from "pptxgenjs";
import { toLabel, fitLine, fitTitle } from "../lib/text.js";
import { getPalette } from "../lib/palette.js";
import { slugify } from "../lib/slugify.js";
import { LOGO_PATH, MASTER_BG_PATH } from "../lib/templateTheme.js";
import { platformFromRequirement } from "../lib/briefFirst.js";
import { buildPitchPlan } from "../lib/pitchStrategist.js";

const SLIDE_W = 13.33;
const SLIDE_H = 7.5;
const MARGIN = 0.42;
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
      line: { color: palette.dark },
    });
  }
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: 0.08,
    fill: { color: palette.accent },
    line: { color: palette.accent },
  });
  addFooter(slide, palette, { page });
}

function addSectionHeader(slide, palette, { kicker, title, subtitle }) {
  slide.addText(truncate(kicker.toUpperCase(), 52), {
    x: MARGIN,
    y: 0.38,
    w: 12.48,
    h: 0.26,
    fontSize: 11,
    bold: true,
    color: palette.accent,
    fontFace: palette.fontTitle,
  });
  slide.addText(truncate(title, 64), {
    x: MARGIN,
    y: 0.65,
    w: 12.48,
    h: 0.45,
    fontSize: 22,
    bold: true,
    color: palette.heading,
    fontFace: palette.fontTitle,
  });
  if (subtitle) {
    slide.addText(truncate(subtitle, 130), {
      x: MARGIN,
      y: 1.12,
      w: 12.48,
      h: 0.38,
      fontSize: 12,
      color: "CBD5E1",
      fontFace: palette.fontBody,
    });
  }
}

// Slide 1: Cover / Title
function addTitleSlide(slide, palette, { companyName, domain, pitchPlan, platformName, requirement, page }) {
  applyMaster(slide, palette, { page, wave: true });

  const logoH = 0.52;
  const logoW = logoH * LOGO_ASPECT;
  if (fs.existsSync(LOGO_PATH)) {
    addBrandLogo(slide, { x: MARGIN, y: 0.65, h: logoH });
  } else {
    slide.addText("APEXON", {
      x: MARGIN,
      y: 0.65,
      w: logoW,
      h: logoH,
      fontSize: 22,
      bold: true,
      color: palette.textLight,
      fontFace: palette.fontTitle,
    });
  }

  const reqLower = (requirement || "").toLowerCase();
  const titleKicker = (platformName && platformName !== "Operating platform" && platformName !== "Enterprise Data Platform" && platformName !== "Microsoft Fabric" && reqLower.includes(platformName.toLowerCase()))
    ? `APEXON  ×  ${pptSafe(companyName).toUpperCase()}  |  ${pptSafe(platformName).toUpperCase()}`
    : `APEXON  ×  ${pptSafe(companyName).toUpperCase()}  |  STRATEGIC PROPOSAL`;

  slide.addText(titleKicker, {
    x: MARGIN,
    y: 1.85,
    w: 12.0,
    h: 0.35,
    fontSize: 14,
    bold: true,
    color: palette.accent,
    fontFace: palette.fontTitle,
  });

  const domainFocus = pitchPlan.primary_business_domain || `${domain} Operations`;
  slide.addText(`Transforming ${pptSafe(domainFocus)} with Real-Time Data and AI`, {
    x: MARGIN,
    y: 2.3,
    w: 12.2,
    h: 1.3,
    fontSize: 32,
    bold: true,
    color: palette.heading,
    fontFace: palette.fontTitle,
    wrap: true,
  });

  slide.addText(
    `A strategic blueprint for ${pptSafe(companyName)} leadership to eliminate operational blind spots, connect daily ${domain.toLowerCase()} telemetry feeds, and empower frontline teams with explainable AI decisions.`,
    {
      x: MARGIN,
      y: 3.75,
      w: 11.5,
      h: 0.85,
      fontSize: 15,
      color: "CBD5E1",
      fontFace: palette.fontBody,
      wrap: true,
    }
  );

  slide.addShape("roundRect", {
    x: MARGIN,
    y: 4.85,
    w: 12.48,
    h: 0.75,
    rectRadius: 0.08,
    fill: { color: palette.card },
    line: { color: palette.cardBorder, width: 1 },
  });
  slide.addText(`PREPARED FOR: ${pptSafe(companyName)}   |   SECTOR: ${pptSafe(domain)}   |   PRIMARY FOCUS: ${pptSafe(domainFocus)}`, {
    x: MARGIN + 0.25,
    y: 5.1,
    w: 12.0,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: "B8C3D4",
    fontFace: palette.fontTitle,
  });
}

// Slide 2: Agenda
function addAgendaSlide(slide, palette, { domain, pitchPlan, page }) {
  applyMaster(slide, palette, { page, wave: true });
  addSectionHeader(slide, palette, {
    kicker: "EXECUTIVE AGENDA",
    title: "What We Will Cover Today",
    subtitle: `A structured executive walkthrough tailored to ${pitchPlan.primary_business_domain} and measurable business ROI.`,
  });

  const sections = (pitchPlan.agenda_items && pitchPlan.agenda_items.length >= 5)
    ? pitchPlan.agenda_items
    : [
        { num: "01", title: "Operational Challenges", desc: `Why delayed signals and manual triage create blind spots in ${pitchPlan.primary_business_domain.toLowerCase()}` },
        { num: "02", title: "Solution Vision", desc: `How a unified platform connects daily operational feeds into real-time action` },
        { num: "03", title: "Data Foundation", desc: `Connecting existing ${domain.toLowerCase()} data feeds and telemetry without disruption` },
        { num: "04", title: "Architecture Overview", desc: `A simple, secure, and governed flow powered by modern Cloud Data & AI` },
        { num: "05", title: "Live Command Center", desc: `Real-time stream monitoring, risk classification, and operational gauges` },
        { num: "06", title: "Explainable AI Decision Engine", desc: `How AI scores event risk factors transparently for frontline teams` },
        { num: "07", title: "Investigation & Outcomes", desc: `Automated queue triage, data readiness matrix, and phased delivery roadmap` },
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
function addChallengesSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  const cm = pitchPlan.challenges_meta || {};
  addSectionHeader(slide, palette, {
    kicker: cm.kicker || "CURRENT OPERATIONAL CHALLENGES",
    title: cm.title || `Siloed Data Slows Down ${pitchPlan.primary_business_domain}`,
    subtitle: cm.subtitle || `${companyName} generates valuable operational signals every minute, but disconnected tools force staff into reactive firefighting.`,
  });

  const challenges = (pitchPlan.operational_challenges || []).slice(0, 6);
  challenges.forEach((ch, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = MARGIN + col * 4.22;
    const y = 1.6 + row * 2.5;

    slide.addShape("roundRect", {
      x, y, w: 4.04, h: 2.35, rectRadius: 0.08,
      fill: { color: palette.card },
      line: { color: palette.cardBorder, width: 1 },
    });
    slide.addText(`0${idx + 1}`, {
      x: x + 0.2, y: y + 0.16, w: 0.6, h: 0.28,
      fontSize: 14, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(truncate(ch.title, 32), {
      x: x + 0.7, y: y + 0.16, w: 3.14, h: 0.32,
      fontSize: 13, bold: true, color: palette.heading, fontFace: palette.fontTitle,
    });
    slide.addText(ch.desc, {
      x: x + 0.2, y: y + 0.55, w: 3.64, h: 1.65,
      fontSize: 11, color: "CBD5E1", fontFace: palette.fontBody, wrap: true,
    });
  });
}

// Slide 4: Solution Vision
function addSolutionVisionSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  const vm = pitchPlan.vision_meta || {};
  addSectionHeader(slide, palette, {
    kicker: vm.kicker || "THE SOLUTION VISION",
    title: vm.title || `One Unified ${pitchPlan.primary_business_domain} Operating Hub`,
    subtitle: vm.subtitle || `A unified real-time data and AI platform connecting daily operational systems into a single operating hub for ${companyName}.`,
  });

  const domainLower = (pitchPlan.primary_business_domain || "").toLowerCase();
  const stages = (pitchPlan.vision_stages && pitchPlan.vision_stages.length === 4)
    ? pitchPlan.vision_stages
    : [
        { num: "01", step: "Connect", desc: `Securely link ${domainLower} feeds, device signals, and historical records in real time (<50ms) without disrupting daily operations.`, color: "1D6EE4" },
        { num: "02", step: "Unify", desc: `Organize all operational data into a single lakehouse source of truth with governed feature stores and baseline profiles.`, color: "0E7C66" },
        { num: "03", step: "Predict & Score", desc: `Run transparent AI models to evaluate composite risk scores (0–100) and pinpoint exact anomaly drivers instantly.`, color: "6366F1" },
        { num: "04", step: "Empower & Act", desc: `Deliver real-time command dashboards, automated workflow triggers, and prioritized work queues directly to frontline leads.`, color: "E54A24" },
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

  const outcomes = (pitchPlan.solution_kpis || []).map(k => k.name).join("  ·  ");
  slide.addShape("roundRect", {
    x: MARGIN, y: 5.65, w: 12.48, h: 0.95, rectRadius: 0.08,
    fill: { color: "0B1220" }, line: { color: palette.accent, width: 1 },
  });
  slide.addText(`TARGET OUTCOMES:  ${outcomes || "Sub-Second Scoring  ·  Lower False Alerts  ·  3x Faster Triage  ·  Zero Unmitigated Losses"}`, {
    x: MARGIN + 0.2, y: 5.95, w: 12.08, h: 0.35,
    fontSize: 11, bold: true, color: palette.textLight, fontFace: palette.fontTitle, align: "center",
  });
}

// Slide 5: Data Foundation
function addDataFoundationSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  const fdm = pitchPlan.data_foundation_meta || {};
  addSectionHeader(slide, palette, {
    kicker: fdm.kicker || "DATA FOUNDATION",
    title: fdm.title || `${companyName} Data Foundation for ${pitchPlan.primary_business_domain}`,
    subtitle: fdm.subtitle || `Connecting the exact operational feeds, telemetry, and historical records needed to power real-time AI.`,
  });

  const feeds = (pitchPlan.data_foundation || []).slice(0, 4);
  feeds.forEach((feed, idx) => {
    const x = MARGIN + idx * 3.16;
    const y = 1.6;
    slide.addShape("roundRect", {
      x, y, w: 2.94, h: 4.8, rectRadius: 0.08,
      fill: { color: palette.card },
      line: { color: palette.cardBorder, width: 1 },
    });
    slide.addText(truncate(feed.category, 30), {
      x: x + 0.18, y: y + 0.2, w: 2.58, h: 0.45,
      fontSize: 14, bold: true, color: palette.heading, fontFace: palette.fontTitle, wrap: true,
    });
    slide.addText(feed.desc, {
      x: x + 0.18, y: y + 0.72, w: 2.58, h: 1.1,
      fontSize: 10, color: "CBD5E1", fontFace: palette.fontBody, wrap: true,
    });
    
    // Systems box
    slide.addShape("roundRect", {
      x: x + 0.16, y: y + 1.95, w: 2.62, h: 1.25, rectRadius: 0.06,
      fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
    });
    slide.addText("PRIMARY SOURCES", {
      x: x + 0.26, y: y + 2.05, w: 2.42, h: 0.22,
      fontSize: 9, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(feed.sourceSystems || "Operational systems", {
      x: x + 0.26, y: y + 2.3, w: 2.42, h: 0.8,
      fontSize: 10, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
    });

    // Fields & Frequency box
    slide.addShape("roundRect", {
      x: x + 0.16, y: y + 3.35, w: 2.62, h: 1.25, rectRadius: 0.06,
      fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
    });
    slide.addText("KEY FIELDS & LATENCY", {
      x: x + 0.26, y: y + 3.45, w: 2.42, h: 0.22,
      fontSize: 9, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
    });
    slide.addText(`${feed.fields}\nFrequency: ${feed.frequency}`, {
      x: x + 0.26, y: y + 3.7, w: 2.42, h: 0.8,
      fontSize: 9, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
    });
  });
}

// Slide 6: Reference Architecture Overview
function addArchitectureSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  const am = pitchPlan.architecture_meta || {};
  addSectionHeader(slide, palette, {
    kicker: am.kicker || "SOLUTION ARCHITECTURE",
    title: am.title || `Modern Data & AI Reference Architecture for ${companyName}`,
    subtitle: am.subtitle || `An end-to-end governed pipeline from real-time event streaming to automated frontline action.`,
  });

  const arch = pitchPlan.solution_architecture || pitchPlan.fabric_architecture || {};
  const tiers = [
    arch.ingestion || { title: "1. Stream Ingestion", subtitle: "Real-Time Event Streams", items: ["Core System Feeds", "Live Telemetry", "Event Streams", "Change Data Capture"] },
    arch.storage || { title: "2. Unified Storage", subtitle: "Enterprise Delta Lakehouse", items: ["12-Month Operational History", "Entity Feature Store", "State Repository", "Governance Logs"] },
    arch.analytics || { title: "3. Real-Time Engine", subtitle: "Streaming Query Engine", items: ["Sub-50ms Stream Processing", "Real-Time Aggregations", "State Transition Radar", "Anomaly Classifier"] },
    arch.ai_layer || { title: "4. AI Layer", subtitle: "Predictive AI & ML Engine", items: ["Composite Risk Score (0–100)", "Transparent Risk Factor Weights", "Predictive Outlier Classifier", "Action Decision Engine"] },
    arch.action || { title: "5. Frontline Action", subtitle: "Command Board & Dispatch", items: ["Live Command Board", "Prioritized Work Queue", "One-Click Evidence Dossier", "Automated Task Dispatch"] },
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
      x: x + 0.1, y: y + 0.15, w: 2.12, h: 0.32,
      fontSize: 12, bold: true, color: palette.heading, fontFace: palette.fontTitle, align: "center",
    });
    slide.addText(tier.subtitle, {
      x: x + 0.1, y: y + 0.48, w: 2.12, h: 0.28,
      fontSize: 10, bold: true, color: idx === 3 ? palette.accent : "7DDEA0", fontFace: palette.fontTitle, align: "center",
    });
    (tier.items || []).slice(0, 4).forEach((item, iIdx) => {
      const iy = y + 0.88 + iIdx * 0.92;
      slide.addShape("roundRect", {
        x: x + 0.12, y: iy, w: 2.08, h: 0.78, rectRadius: 0.06,
        fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
      });
      slide.addText(item, {
        x: x + 0.16, y: iy + 0.14, w: 2.0, h: 0.5,
        fontSize: 9, color: palette.textLight, fontFace: palette.fontBody, align: "center", wrap: true,
      });
    });
  });
}

// Slides 7–11: 5 Dedicated Use Case Deep-Dive Slides
function addUseCaseDeepDiveSlide(slide, palette, { companyName, pitchPlan, useCase, index, page }) {
  applyMaster(slide, palette, { page });
  
  const uc = useCase || {};
  const ucNum = index + 1;
  const kicker = `USE CASE ${ucNum} OF 5`;
  const title = uc.title || `Operational Use Case ${ucNum}`;
  const subtitle = uc.subtitle || uc.tagline || "High-impact real-time operational intelligence.";

  addSectionHeader(slide, palette, { kicker, title, subtitle });

  // Left Column: Main Problem & Solution Card
  const leftX = MARGIN;
  const leftW = 7.8;
  const mainH = 3.75;
  slide.addShape("roundRect", {
    x: leftX, y: 1.6, w: leftW, h: mainH, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: palette.cardBorder, width: 1 },
  });

  // Problem Section
  slide.addText("THE PROBLEM", {
    x: leftX + 0.25, y: 1.8, w: leftW - 0.5, h: 0.26,
    fontSize: 10, bold: true, color: palette.accent, fontFace: palette.fontTitle,
  });
  const problemText = uc.challenge || uc.businessProblem || "Operational friction and delayed visibility limit proactive decisions.";
  slide.addText(truncate(problemText, 240), {
    x: leftX + 0.25, y: 2.1, w: leftW - 0.5, h: 1.15,
    fontSize: 11, color: "CBD5E1", fontFace: palette.fontBody, wrap: true,
  });

  // Solution Section
  slide.addText("THE SOLUTION & AI APPROACH", {
    x: leftX + 0.25, y: 3.35, w: leftW - 0.5, h: 0.26,
    fontSize: 10, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
  });
  const solutionText = uc.solutionFit || uc.benefit || uc.insight || (Array.isArray(uc.solutionMoves) && uc.solutionMoves.length ? uc.solutionMoves.map(m => m.detail || m.lead).join(". ") : "Real-time stream intelligence unifies data feeds into automated frontline action.");
  slide.addText(truncate(solutionText, 280), {
    x: leftX + 0.25, y: 3.65, w: leftW - 0.5, h: 1.55,
    fontSize: 11, color: palette.heading, fontFace: palette.fontBody, wrap: true,
  });

  // Left Bottom Box 1: Data Sources
  const boxW = 3.78;
  const boxH = 1.35;
  const boxY = 5.5;
  slide.addShape("roundRect", {
    x: leftX, y: boxY, w: boxW, h: boxH, rectRadius: 0.06,
    fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
  });
  slide.addText("DATA SOURCES", {
    x: leftX + 0.2, y: boxY + 0.12, w: boxW - 0.4, h: 0.22,
    fontSize: 9, bold: true, color: palette.accent, fontFace: palette.fontTitle,
  });
  const sourcesText = Array.isArray(uc.worksWith) && uc.worksWith.length ? uc.worksWith.join(", ") : "Core enterprise records, event streams, real-time telemetry";
  slide.addText(truncate(sourcesText, 110), {
    x: leftX + 0.2, y: boxY + 0.36, w: boxW - 0.4, h: 0.85,
    fontSize: 10, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
  });

  // Left Bottom Box 2: Platform & AI Components
  const box2X = leftX + boxW + 0.24;
  slide.addShape("roundRect", {
    x: box2X, y: boxY, w: boxW, h: boxH, rectRadius: 0.06,
    fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
  });
  slide.addText("AI & PLATFORM COMPONENTS", {
    x: box2X + 0.2, y: boxY + 0.12, w: boxW - 0.4, h: 0.22,
    fontSize: 9, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
  });
  const techText = Array.isArray(uc.techComponents) && uc.techComponents.length ? uc.techComponents.join(" • ") : "Eventstream • Delta Lakehouse • Machine Learning Models • Real-Time Dashboards • Action Trigger";
  slide.addText(truncate(techText, 110), {
    x: box2X + 0.2, y: boxY + 0.36, w: boxW - 0.4, h: 0.85,
    fontSize: 10, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
  });

  // Right Column: Expected Impact (3 Stacked Stat Cards)
  const rightX = leftX + leftW + 0.28;
  const rightW = 4.4;
  slide.addShape("roundRect", {
    x: rightX, y: 1.6, w: rightW, h: 5.25, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: palette.cardBorder, width: 1 },
  });
  slide.addText("EXPECTED IMPACT", {
    x: rightX + 0.25, y: 1.8, w: rightW - 0.5, h: 0.28,
    fontSize: 11, bold: true, color: palette.accent, fontFace: palette.fontTitle,
  });

  // 3 Stats
  const stats = (Array.isArray(uc.impactStats) && uc.impactStats.length >= 3)
    ? uc.impactStats
    : (Array.isArray(uc.kpis) && uc.kpis.length >= 2)
      ? [
          { value: uc.kpis[0].value || uc.proofPoint || "25–35%", label: uc.kpis[0].name || "Target KPI improvement" },
          { value: uc.kpis[1]?.value || "-30%", label: uc.kpis[1]?.name || "Operational bottleneck reduction" },
          { value: uc.kpis[2]?.value || "Live", label: uc.kpis[2]?.name || "Continuous automated scoring" }
        ]
      : [
          { value: uc.proofPoint || "25–35%", label: "Target operational benchmark lift" },
          { value: "-40%", label: "Cycle time & friction reduction" },
          { value: "Live", label: "100% real-time evaluation across feeds" }
        ];

  const colors = [palette.accent, "7DDEA0", "FACC15"];
  stats.slice(0, 3).forEach((st, sIdx) => {
    const sy = 2.2 + sIdx * 1.5;
    slide.addShape("roundRect", {
      x: rightX + 0.2, y: sy, w: rightW - 0.4, h: 1.35, rectRadius: 0.06,
      fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
    });
    slide.addText(st.value || "20–30%", {
      x: rightX + 0.35, y: sy + 0.12, w: rightW - 0.7, h: 0.52,
      fontSize: 26, bold: true, color: colors[sIdx % colors.length], fontFace: palette.fontTitle,
    });
    slide.addText(st.label || "Key operational improvement", {
      x: rightX + 0.35, y: sy + 0.68, w: rightW - 0.7, h: 0.55,
      fontSize: 11, color: "CBD5E1", fontFace: palette.fontBody, wrap: true,
    });
  });
}

// Slide 12: Technical Feasibility Matrix
function addDataReadinessSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  const rm = pitchPlan.readiness_meta || {};
  addSectionHeader(slide, palette, {
    kicker: rm.kicker || "TECHNICAL FEASIBILITY",
    title: rm.title || "Feasible on Existing Systems — No Rip-and-Replace",
    subtitle: rm.subtitle || `Each use case connects to ${companyName}'s current systems through standard connectors and layers real-time AI on top.`,
  });

  const headers = ["Use Case", "Data Readiness", "Technical Complexity", "Time to Value", "Feasibility Note"];
  const colW = [3.2, 1.8, 1.8, 1.6, 3.68];
  
  const tableY = 1.6;
  slide.addShape("roundRect", {
    x: MARGIN, y: tableY, w: 12.48, h: 4.8, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: palette.cardBorder, width: 1 },
  });

  // Table Headers
  let cx = MARGIN + 0.2;
  headers.forEach((h, i) => {
    slide.addText(h, {
      x: cx, y: tableY + 0.2, w: colW[i], h: 0.28,
      fontSize: 10, bold: true, color: "9AA6B8", fontFace: palette.fontTitle,
    });
    cx += colW[i];
  });

  const rows = (pitchPlan.feasibility_matrix || pitchPlan.use_cases || []).slice(0, 5);
  rows.forEach((r, idx) => {
    const ry = tableY + 0.58 + idx * 0.8;
    slide.addShape("roundRect", {
      x: MARGIN + 0.15, y: ry, w: 12.18, h: 0.72, rectRadius: 0.04,
      fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
    });

    cx = MARGIN + 0.2;
    const rowValues = [
      r.title || `Use Case ${idx + 1}`,
      r.dataReadiness || r.readiness || "High",
      r.complexity || (r.difficulty === "harder" ? "High" : r.difficulty === "moderate" ? "Medium" : "Low") || "Medium",
      r.timeToValue || (idx === 0 ? "6–8 weeks" : idx === 1 ? "8–10 weeks" : idx === 2 ? "10–12 weeks" : "12–16 weeks"),
      r.feasibilityNote || `Connects via standard APIs and event stream connector without system replacement.`
    ];

    rowValues.forEach((val, cIdx) => {
      slide.addText(val, {
        x: cx, y: ry + 0.14, w: colW[cIdx], h: 0.45,
        fontSize: cIdx === 0 ? 11 : 9,
        bold: cIdx === 0 || cIdx === 1 || cIdx === 2,
        color: cIdx === 0 ? palette.heading : cIdx === 1 ? "7DDEA0" : cIdx === 2 ? "FACC15" : "CBD5E1",
        fontFace: palette.fontBody,
        wrap: true,
      });
      cx += colW[cIdx];
    });
  });
}

// Slide 13: Delivery Roadmap
function addRoadmapSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  const rdm = pitchPlan.roadmap_meta || {};
  addSectionHeader(slide, palette, {
    kicker: rdm.kicker || "IMPLEMENTATION ROADMAP",
    title: rdm.title || `A Phased Path from Pilot to Network-Wide Scale for ${companyName}`,
    subtitle: rdm.subtitle || `A structured milestone plan delivering live operational value across ${companyName} within 8 weeks.`,
  });

  const phases = (pitchPlan.roadmap_phases || []).slice(0, 4);
  phases.forEach((ph, idx) => {
    const x = MARGIN + idx * 3.16;
    const y = 1.6;
    slide.addShape("roundRect", {
      x, y, w: 2.94, h: 4.8, rectRadius: 0.08,
      fill: { color: palette.card },
      line: { color: idx === 0 ? palette.accent : palette.cardBorder, width: idx === 0 ? 1.5 : 1 },
    });
    slide.addText(ph.title, {
      x: x + 0.18, y: y + 0.2, w: 2.58, h: 0.42,
      fontSize: 14, bold: true, color: palette.heading, fontFace: palette.fontTitle, wrap: true,
    });
    slide.addText(ph.time, {
      x: x + 0.18, y: y + 0.65, w: 2.58, h: 0.28,
      fontSize: 12, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    (ph.items || []).slice(0, 4).forEach((item, iIdx) => {
      const iy = y + 1.1 + iIdx * 0.88;
      slide.addShape("roundRect", {
        x: x + 0.18, y: iy, w: 2.58, h: 0.78, rectRadius: 0.06,
        fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
      });
      slide.addText(`• ${item}`, {
        x: x + 0.24, y: iy + 0.1, w: 2.44, h: 0.58,
        fontSize: 9, color: "CBD5E1", fontFace: palette.fontBody, wrap: true,
      });
    });
  });
}

// Slide 14: Expected Impact & Next Steps
function addNextStepsSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page, wave: true });
  const nsm = pitchPlan.next_steps_meta || {};
  addSectionHeader(slide, palette, {
    kicker: nsm.kicker || "EXPECTED IMPACT & NEXT STEPS",
    title: nsm.title || `From Pilot to Measurable Network-Wide Value for ${companyName}`,
    subtitle: nsm.subtitle || `A collaborative 3-step engagement plan to validate data readiness and launch the live operational pilot.`,
  });

  // Top 4 Stat Cards
  const kpis = (pitchPlan.overall_impact_kpis || pitchPlan.solution_kpis || []).slice(0, 4);
  kpis.forEach((k, idx) => {
    const x = MARGIN + idx * 3.16;
    const y = 1.6;
    slide.addShape("roundRect", {
      x, y, w: 2.94, h: 1.85, rectRadius: 0.08,
      fill: { color: palette.card }, line: { color: idx === 0 ? palette.accent : palette.cardBorder, width: 1 },
    });
    slide.addText(k.value || k.benchmark || "25–35%", {
      x: x + 0.18, y: y + 0.15, w: 2.58, h: 0.48,
      fontSize: 24, bold: true, color: idx === 0 ? palette.accent : "7DDEA0", fontFace: palette.fontTitle,
    });
    slide.addText(k.name || k.label || "Operational KPI", {
      x: x + 0.18, y: y + 0.68, w: 2.58, h: 0.95,
      fontSize: 11, bold: true, color: palette.heading, fontFace: palette.fontTitle, wrap: true,
    });
  });

  // Bottom Next Steps Card
  const boxY = 3.65;
  slide.addShape("roundRect", {
    x: MARGIN, y: boxY, w: 12.48, h: 2.65, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: palette.cardBorder, width: 1 },
  });
  slide.addText("STRATEGIC NEXT STEPS", {
    x: MARGIN + 0.25, y: boxY + 0.18, w: 11.98, h: 0.25,
    fontSize: 11, bold: true, color: palette.accent, fontFace: palette.fontTitle,
  });

  const steps = (pitchPlan.next_steps || []).slice(0, 3);
  steps.forEach((st, idx) => {
    const sy = boxY + 0.5 + idx * 0.68;
    slide.addShape("roundRect", {
      x: MARGIN + 0.2, y: sy, w: 12.08, h: 0.58, rectRadius: 0.04,
      fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
    });
    slide.addText(st.num || `0${idx + 1}`, {
      x: MARGIN + 0.35, y: sy + 0.1, w: 0.5, h: 0.35,
      fontSize: 14, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(st.title ? `${st.title} — ${st.desc}` : st.desc, {
      x: MARGIN + 0.95, y: sy + 0.1, w: 11.1, h: 0.4,
      fontSize: 10, color: "CBD5E1", fontFace: palette.fontBody, wrap: true,
    });
  });

  // Ready banner
  slide.addShape("roundRect", {
    x: MARGIN, y: 6.45, w: 12.48, h: 0.55, rectRadius: 0.06,
    fill: { color: "0B1220" }, line: { color: "0E7C66", width: 1.5 },
  });
  slide.addText(`READY TO BEGIN:  Apexon Solution Architecture Team  ·  Contact: solutions@apexon.com`, {
    x: MARGIN + 0.2, y: 6.55, w: 12.08, h: 0.3,
    fontSize: 11, bold: true, color: "7DDEA0", fontFace: palette.fontTitle, align: "center",
  });
}

export async function buildDeck({
  companyName,
  domain,
  requirement,
  research,
  researchStructured,
  useCases,
  pitchPlan,
  outputPath,
}) {
  if (!companyName || !domain) {
    throw new Error("buildDeck requires companyName and domain");
  }

  const palette = getPalette(domain, companyName);
  const slug = slugify(companyName);
  const finalPath = outputPath || path.join("./output", `${slug}-pitch-deck.pptx`);
  fs.mkdirSync(path.dirname(finalPath), { recursive: true });

  const platform = platformFromRequirement(requirement, domain);
  const platformName = platform.name === "Operating platform" ? "Enterprise Data Platform" : platform.name;
  
  // Build or use provided pitchPlan with dynamic AI enrichment
  const plan = pitchPlan || buildPitchPlan({ companyName, domain, requirement, useCases, research, researchStructured });

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Apexon";
  pres.title = `${pptSafe(companyName)} — ${pptSafe(plan.primary_business_domain)}`;
  pres.subject = pptSafe(`${companyName} — ${requirement}`);

  let page = 1;

  // Slide 1: Cover
  {
    const slide = pres.addSlide();
    addTitleSlide(slide, palette, { companyName, domain, pitchPlan: plan, platformName, requirement, page });
    page += 1;
  }

  // Slide 2: Agenda
  {
    const slide = pres.addSlide();
    addAgendaSlide(slide, palette, { domain, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 3: Operational Challenges
  {
    const slide = pres.addSlide();
    addChallengesSlide(slide, palette, { companyName, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 4: Solution Vision
  {
    const slide = pres.addSlide();
    addSolutionVisionSlide(slide, palette, { companyName, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 5: Data Foundation
  {
    const slide = pres.addSlide();
    addDataFoundationSlide(slide, palette, { companyName, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 6: Architecture Overview
  {
    const slide = pres.addSlide();
    addArchitectureSlide(slide, palette, { companyName, pitchPlan: plan, page });
    page += 1;
  }

  // Slides 7–11: 5 Dedicated Use Case Deep-Dive Slides
  const useCasesList = (plan.use_cases && plan.use_cases.length >= 5)
    ? plan.use_cases.slice(0, 5)
    : (useCases && Array.isArray(useCases.useCases) && useCases.useCases.length >= 1)
      ? useCases.useCases.slice(0, 5)
      : (plan.use_cases || []);

  useCasesList.forEach((uc, idx) => {
    const slide = pres.addSlide();
    addUseCaseDeepDiveSlide(slide, palette, { companyName, pitchPlan: plan, useCase: uc, index: idx, page });
    page += 1;
  });

  // Slide 12: Technical Feasibility Matrix
  {
    const slide = pres.addSlide();
    addDataReadinessSlide(slide, palette, { companyName, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 13: Delivery Roadmap
  {
    const slide = pres.addSlide();
    addRoadmapSlide(slide, palette, { companyName, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 14: Expected Impact & Next Steps
  {
    const slide = pres.addSlide();
    addNextStepsSlide(slide, palette, { companyName, pitchPlan: plan, page });
    page += 1;
  }

  await pres.writeFile({ fileName: finalPath });
  return finalPath;
}
