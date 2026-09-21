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

// Slide 7: Live Operations Command Center
function addCommandCenterSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  const cc = pitchPlan.command_center || {};
  addSectionHeader(slide, palette, {
    kicker: cc.kicker || "OPERATIONAL CAPABILITY 1 OF 5  |  COMMAND RADAR",
    title: cc.title || `${companyName} Live Operations Command Center`,
    subtitle: cc.subtitle || `Continuous sub-second evaluation of incoming operational streams with instant anomaly risk classification.`,
  });

  // Top metric bar (4 summary KPIs)
  (cc.metrics || []).slice(0, 4).forEach((m, idx) => {
    const mx = MARGIN + idx * 3.16;
    slide.addShape("roundRect", {
      x: mx, y: 1.6, w: 2.94, h: 1.25, rectRadius: 0.08,
      fill: { color: palette.card }, line: { color: idx === 1 ? palette.accent : palette.cardBorder, width: 1 },
    });
    slide.addText(m.val, {
      x: mx + 0.18, y: 1.72, w: 2.58, h: 0.42,
      fontSize: 22, bold: true, color: idx === 1 ? palette.accent : palette.heading, fontFace: palette.fontTitle,
    });
    slide.addText(m.label, {
      x: mx + 0.18, y: 2.16, w: 2.58, h: 0.28,
      fontSize: 11, bold: true, color: "CBD5E1", fontFace: palette.fontTitle,
    });
    slide.addText(m.note, {
      x: mx + 0.18, y: 2.45, w: 2.58, h: 0.25,
      fontSize: 9, color: "7DDEA0", fontFace: palette.fontBody,
    });
  });

  // Live Stream Table
  const tableY = 3.05;
  slide.addShape("roundRect", {
    x: MARGIN, y: tableY, w: 12.48, h: 3.4, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: palette.cardBorder, width: 1 },
  });
  slide.addText("LIVE EVALUATION STREAM (LAST 60 SECONDS)", {
    x: MARGIN + 0.25, y: tableY + 0.15, w: 11.98, h: 0.25,
    fontSize: 11, bold: true, color: palette.accent, fontFace: palette.fontTitle,
  });

  const headers = cc.headers || ["Event ID", "Entity / Unit", "Channel & Source", "Facility / Location", "Observed Metric", "Risk Score", "Decision Action"];
  const colW = cc.colW || [1.5, 2.0, 2.2, 2.0, 1.4, 1.3, 1.88];
  
  // Headers
  let cx = MARGIN + 0.2;
  headers.forEach((h, i) => {
    slide.addText(h, {
      x: cx, y: tableY + 0.45, w: colW[i], h: 0.25,
      fontSize: 9, bold: true, color: "9AA6B8", fontFace: palette.fontTitle,
    });
    cx += colW[i];
  });

  const sampleRows = (pitchPlan.investigation_queue || []).slice(0, 4);
  sampleRows.forEach((r, rIdx) => {
    const ry = tableY + 0.78 + rIdx * 0.6;
    slide.addShape("rect", {
      x: MARGIN + 0.15, y: ry - 0.05, w: 12.18, h: 0.52,
      fill: { color: r.priority === "CRITICAL" ? "1A162B" : "0B1220" },
      line: { color: r.priority === "CRITICAL" ? "E54A24" : "2D3F63", width: 1 },
    });
    cx = MARGIN + 0.2;
    
    const channel = cc.channelName || "Operational Telemetry Feed";
    const location = r.priority === "CRITICAL" ? (cc.locForeign || "Priority Anomaly Node") : (cc.locDomestic || "Standard Operating Node");

    const rowValues = [
      r.caseId,
      r.entity,
      channel,
      location,
      r.amount,
      `${r.riskScore}/100`,
      r.action,
    ];
    rowValues.forEach((val, cIdx) => {
      slide.addText(val, {
        x: cx, y: ry + 0.08, w: colW[cIdx], h: 0.35,
        fontSize: 10,
        bold: cIdx === 0 || cIdx === 5 || cIdx === 6,
        color: cIdx === 5 && r.priority === "CRITICAL" ? "FF7A59" : cIdx === 6 ? "7DDEA0" : palette.textLight,
        fontFace: palette.fontBody,
      });
      cx += colW[cIdx];
    });
  });
}

// Slide 8: Explainable AI Decision Engine
function addExplainableSlide(slide, palette, { pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  const ex = pitchPlan.explainable_example || {};

  addSectionHeader(slide, palette, {
    kicker: ex.kicker || "OPERATIONAL CAPABILITY 2 OF 5  |  TRANSPARENT AI",
    title: ex.title || "Why Did the AI Model Flag This Incident?",
    subtitle: ex.subtitle || "Every automated decision provides an instant, transparent breakdown of risk factors for frontline analysts.",
  });

  // Left Card: The Incident Profile
  const leftX = MARGIN;
  slide.addShape("roundRect", {
    x: leftX, y: 1.6, w: 4.8, h: 4.8, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "E54A24", width: 1.5 },
  });
  slide.addText(ex.dossierTitle || "INSPECTED EVENT DOSSIER", {
    x: leftX + 0.25, y: 1.8, w: 4.3, h: 0.28,
    fontSize: 11, bold: true, color: "FF7A59", fontFace: palette.fontTitle,
  });
  slide.addText(`Event Ref: ${ex.txnId || "OPS-ALERT-101"}`, {
    x: leftX + 0.25, y: 2.15, w: 4.3, h: 0.38,
    fontSize: 18, bold: true, color: palette.heading, fontFace: palette.fontTitle,
  });

  const details = [
    { label: "Observed Value / Impact", val: ex.amount || "High Urgency Exception" },
    { label: "Channel & Timestamp", val: `${ex.channel || "Operational Hub"} · ${ex.timestamp || "Live"}` },
    { label: "Observed Location / Unit", val: `${ex.location || "Active Node"} (Baseline: ${ex.baselineLocation || "Nominal"})` },
    { label: "Observed Device / Feed", val: `${ex.device || "Telemetry Feed"} (Baseline: ${ex.baselineDevice || "Standard"})` },
    { label: "Composite AI Risk Score", val: `${ex.riskScore || 89} / 100 (${ex.riskLevel || "CRITICAL"})` },
    { label: "Recommended AI Action", val: ex.decision || "TRIGGER AUTOMATED WORKFLOW" },
  ];

  details.forEach((d, idx) => {
    const dy = 2.65 + idx * 0.6;
    slide.addText(d.label, {
      x: leftX + 0.25, y: dy, w: 4.3, h: 0.2,
      fontSize: 9, bold: true, color: "9AA6B8", fontFace: palette.fontTitle,
    });
    slide.addText(d.val, {
      x: leftX + 0.25, y: dy + 0.18, w: 4.3, h: 0.35,
      fontSize: idx >= 4 ? 12 : 11,
      bold: idx >= 4,
      color: idx === 4 ? "FF7A59" : idx === 5 ? "7DDEA0" : palette.textLight,
      fontFace: palette.fontBody,
      wrap: true,
    });
  });

  // Right Side: 4 Risk Factor Breakdown Cards
  const rightX = MARGIN + 5.1;
  slide.addShape("roundRect", {
    x: rightX, y: 1.6, w: 7.38, h: 4.8, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: palette.cardBorder, width: 1 },
  });
  slide.addText(ex.factorsTitle || "TRANSPARENT RISK FACTOR DECOMPOSITION", {
    x: rightX + 0.25, y: 1.8, w: 6.88, h: 0.28,
    fontSize: 11, bold: true, color: palette.accent, fontFace: palette.fontTitle,
  });

  (ex.factors || []).slice(0, 4).forEach((f, fIdx) => {
    const fy = 2.18 + fIdx * 1.05;
    slide.addShape("roundRect", {
      x: rightX + 0.25, y: fy, w: 6.88, h: 0.92, rectRadius: 0.06,
      fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
    });
    slide.addText(f.weight, {
      x: rightX + 0.4, y: fy + 0.18, w: 0.8, h: 0.35,
      fontSize: 18, bold: true, color: "FF7A59", fontFace: palette.fontTitle,
    });
    slide.addText(f.factor, {
      x: rightX + 1.25, y: fy + 0.14, w: 5.6, h: 0.28,
      fontSize: 12, bold: true, color: palette.heading, fontFace: palette.fontTitle,
    });
    slide.addText(f.reason, {
      x: rightX + 1.25, y: fy + 0.42, w: 5.6, h: 0.42,
      fontSize: 10, color: "CBD5E1", fontFace: palette.fontBody, wrap: true,
    });
  });
}

// Slide 9: Customer Behavioral Profiling
function addBehavioralSlide(slide, palette, { pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  const bp = pitchPlan.behavioral_profile || {};

  addSectionHeader(slide, palette, {
    kicker: bp.kicker || "OPERATIONAL CAPABILITY 3 OF 5  |  BEHAVIORAL INTELLIGENCE",
    title: bp.title || "Multi-Dimensional Baseline vs. Anomaly Radar",
    subtitle: bp.subtitle || `Continuous machine learning compares every live event against 12 months of operational history.`,
  });

  // Left Box: 12-Month Baseline Profile
  const leftX = MARGIN;
  slide.addShape("roundRect", {
    x: leftX, y: 1.6, w: 5.9, h: 4.1, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "0E7C66", width: 1.5 },
  });
  slide.addText(bp.baselineTitle || `ESTABLISHED 12-MONTH BASELINE PROFILE: ${truncate(bp.entityName || "Operational Baseline", 32)}`, {
    x: leftX + 0.25, y: 1.8, w: 5.4, h: 0.28,
    fontSize: 11, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
  });

  (bp.baseline || []).slice(0, 5).forEach((b, idx) => {
    const by = 2.18 + idx * 0.72;
    slide.addShape("roundRect", {
      x: leftX + 0.25, y: by, w: 5.4, h: 0.62, rectRadius: 0.04,
      fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
    });
    slide.addText(b.dimension, {
      x: leftX + 0.4, y: by + 0.08, w: 2.2, h: 0.22,
      fontSize: 9, bold: true, color: "9AA6B8", fontFace: palette.fontTitle,
    });
    slide.addText(b.value, {
      x: leftX + 0.4, y: by + 0.28, w: 5.1, h: 0.28,
      fontSize: 11, bold: true, color: palette.textLight, fontFace: palette.fontBody,
    });
  });

  // Right Box: Current Outlier Event
  const rightX = MARGIN + 6.3;
  slide.addShape("roundRect", {
    x: rightX, y: 1.6, w: 6.18, h: 4.1, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "E54A24", width: 1.5 },
  });
  slide.addText(bp.anomalyTitle || "CURRENT ANOMALOUS EVENT DEVIATION", {
    x: rightX + 0.25, y: 1.8, w: 5.68, h: 0.28,
    fontSize: 11, bold: true, color: "FF7A59", fontFace: palette.fontTitle,
  });

  (bp.anomaly || []).slice(0, 5).forEach((a, idx) => {
    const ay = 2.18 + idx * 0.72;
    slide.addShape("roundRect", {
      x: rightX + 0.25, y: ay, w: 5.68, h: 0.62, rectRadius: 0.04,
      fill: { color: "1A162B" }, line: { color: "E54A24", width: 1 },
    });
    slide.addText(`${a.dimension} (${a.status})`, {
      x: rightX + 0.4, y: ay + 0.08, w: 3.5, h: 0.22,
      fontSize: 9, bold: true, color: "FF7A59", fontFace: palette.fontTitle,
    });
    slide.addText(a.value, {
      x: rightX + 0.4, y: ay + 0.28, w: 5.3, h: 0.28,
      fontSize: 11, bold: true, color: palette.heading, fontFace: palette.fontBody,
    });
  });

  // Bottom Conclusion Bar
  slide.addShape("roundRect", {
    x: MARGIN, y: 5.85, w: 12.48, h: 0.75, rectRadius: 0.08,
    fill: { color: "0B1220" }, line: { color: palette.accent, width: 1 },
  });
  slide.addText(`AI PROFILE VERDICT:  ${bp.conclusion || "Multi-dimensional anomaly detected"}`, {
    x: MARGIN + 0.3, y: 6.08, w: 11.88, h: 0.3,
    fontSize: 11, bold: true, color: palette.heading, fontFace: palette.fontTitle, align: "center",
  });
}

// Slide 10: Investigation Prioritization Queue
function addQueueSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  const qm = pitchPlan.queue_meta || {};
  addSectionHeader(slide, palette, {
    kicker: qm.kicker || "OPERATIONAL CAPABILITY 4 OF 5  |  INVESTIGATION QUEUE",
    title: qm.title || "AI-Prioritized Case Triage & Frontline Action Queue",
    subtitle: qm.subtitle || `High-urgency incidents are ranked Critical/High with pre-assembled dossiers so teams act in seconds.`,
  });

  const headers = qm.headers || ["Priority Tier", "Case Ref", "Entity / Unit", "Observed Value", "Primary Trigger", "One-Click Operational Action"];
  const colW = qm.colW || [1.8, 1.4, 1.8, 1.6, 3.4, 2.48];
  
  const tableY = 1.6;
  slide.addShape("roundRect", {
    x: MARGIN, y: tableY, w: 12.48, h: 4.8, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: palette.cardBorder, width: 1 },
  });

  let cx = MARGIN + 0.2;
  headers.forEach((h, i) => {
    slide.addText(h, {
      x: cx, y: tableY + 0.2, w: colW[i], h: 0.28,
      fontSize: 10, bold: true, color: "9AA6B8", fontFace: palette.fontTitle,
    });
    cx += colW[i];
  });

  const cases = (pitchPlan.investigation_queue || []).slice(0, 5);
  cases.forEach((c, idx) => {
    const ry = tableY + 0.6 + idx * 0.8;
    const isCrit = c.priority === "CRITICAL";
    const isHigh = c.priority === "HIGH";
    
    slide.addShape("roundRect", {
      x: MARGIN + 0.15, y: ry, w: 12.18, h: 0.68, rectRadius: 0.04,
      fill: { color: isCrit ? "1E1424" : "0B1220" },
      line: { color: isCrit ? "E54A24" : isHigh ? "EAB308" : "2D3F63", width: 1 },
    });

    cx = MARGIN + 0.2;
    const rowValues = [
      c.priority,
      c.caseId,
      c.entity,
      c.amount,
      c.trigger,
      c.action
    ];

    rowValues.forEach((val, cIdx) => {
      slide.addText(val, {
        x: cx, y: ry + 0.16, w: colW[cIdx], h: 0.4,
        fontSize: cIdx === 0 || cIdx === 5 ? 11 : 10,
        bold: cIdx === 0 || cIdx === 5,
        color: cIdx === 0 && isCrit ? "FF7A59" : cIdx === 0 && isHigh ? "FACC15" : cIdx === 5 ? "7DDEA0" : palette.textLight,
        fontFace: palette.fontBody,
      });
      cx += colW[cIdx];
    });
  });
}

// Slide 11: Business Outcomes & Value Loop
function addOutcomesSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  const om = pitchPlan.outcomes_meta || {};
  addSectionHeader(slide, palette, {
    kicker: om.kicker || "OPERATIONAL CAPABILITY 5 OF 5  |  BUSINESS OUTCOMES",
    title: om.title || `Measurable Solution Performance for ${companyName}`,
    subtitle: om.subtitle || `Projected operational benchmarks tailored specifically to ${pitchPlan.primary_business_domain}.`,
  });

  const kpis = (pitchPlan.solution_kpis || []).slice(0, 4);
  kpis.forEach((k, idx) => {
    const x = MARGIN + idx * 3.16;
    const y = 1.6;
    slide.addShape("roundRect", {
      x, y, w: 2.94, h: 2.4, rectRadius: 0.08,
      fill: { color: palette.card }, line: { color: palette.accent, width: 1.5 },
    });
    slide.addText(k.benchmark, {
      x: x + 0.18, y: y + 0.2, w: 2.58, h: 0.48,
      fontSize: 24, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(k.name, {
      x: x + 0.18, y: y + 0.72, w: 2.58, h: 0.4,
      fontSize: 13, bold: true, color: palette.heading, fontFace: palette.fontTitle, wrap: true,
    });
    slide.addText(k.desc, {
      x: x + 0.18, y: y + 1.18, w: 2.58, h: 0.9,
      fontSize: 10, color: "CBD5E1", fontFace: palette.fontBody, wrap: true,
    });
    slide.addText(`Type: ${k.type}`, {
      x: x + 0.18, y: y + 2.05, w: 2.58, h: 0.25,
      fontSize: 9, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
    });
  });

  // Bottom Loop Box: Closed-Loop Architecture
  const loopY = 4.25;
  slide.addShape("roundRect", {
    x: MARGIN, y: loopY, w: 12.48, h: 2.3, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "0E7C66", width: 1.5 },
  });
  slide.addText(pitchPlan.closed_loop_title || "CLOSED-LOOP CONTINUOUS LEARNING ARCHITECTURE", {
    x: MARGIN + 0.3, y: loopY + 0.18, w: 11.88, h: 0.28,
    fontSize: 12, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
  });

  const loopSteps = (pitchPlan.closed_loop_steps || []).slice(0, 4);
  loopSteps.forEach((s, idx) => {
    const sx = MARGIN + 0.25 + idx * 3.02;
    slide.addShape("roundRect", {
      x: sx, y: loopY + 0.58, w: 2.88, h: 1.45, rectRadius: 0.06,
      fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
    });
    slide.addText(s.title, {
      x: sx + 0.15, y: loopY + 0.7, w: 2.58, h: 0.3,
      fontSize: 11, bold: true, color: palette.heading, fontFace: palette.fontTitle,
    });
    slide.addText(s.desc, {
      x: sx + 0.15, y: loopY + 1.05, w: 2.58, h: 0.85,
      fontSize: 10, color: "B8C3D4", fontFace: palette.fontBody, wrap: true,
    });
  });
}

// Slide 12: Technical Data Readiness Matrix
function addDataReadinessSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  const rm = pitchPlan.readiness_meta || {};
  addSectionHeader(slide, palette, {
    kicker: rm.kicker || "DATA READINESS & DISCOVERY MATRIX",
    title: rm.title || "Fast-Track Integration & Feasibility Assessment",
    subtitle: rm.subtitle || `All required data feeds connect to existing enterprise infrastructure without requiring system replacements.`,
  });

  const headers = ["Data Domain", "Required Key Fields", "Potential Source Systems", "Ingestion Frequency", "Discovery Status"];
  const colW = [2.4, 3.8, 3.2, 1.6, 1.48];
  
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

  const dataFeeds = (pitchPlan.data_foundation || []).slice(0, 5);
  dataFeeds.forEach((df, idx) => {
    const ry = tableY + 0.58 + idx * 0.8;
    slide.addShape("roundRect", {
      x: MARGIN + 0.15, y: ry, w: 12.18, h: 0.72, rectRadius: 0.04,
      fill: { color: "0B1220" }, line: { color: "2D3F63", width: 1 },
    });

    cx = MARGIN + 0.2;
    const rowValues = [
      df.category,
      df.fields,
      df.sourceSystems,
      df.frequency,
      df.readiness || "Standard Ingestion Ready"
    ];

    rowValues.forEach((val, cIdx) => {
      slide.addText(val, {
        x: cx, y: ry + 0.14, w: colW[cIdx], h: 0.45,
        fontSize: cIdx === 0 ? 11 : 9,
        bold: cIdx === 0 || cIdx === 4,
        color: cIdx === 0 ? palette.heading : cIdx === 4 ? "FACC15" : "CBD5E1",
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
    kicker: rdm.kicker || "DELIVERY ROADMAP",
    title: rdm.title || "A Phased Path from Fast Pilot to Enterprise Scale",
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

// Slide 14: Next Steps & Discovery Kick-off
function addNextStepsSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page, wave: true });
  const nsm = pitchPlan.next_steps_meta || {};
  addSectionHeader(slide, palette, {
    kicker: nsm.kicker || "NEXT STEPS & ENGAGEMENT PLAN",
    title: nsm.title || `Next Steps to Initiate Discovery for ${companyName}`,
    subtitle: nsm.subtitle || `A collaborative 3-step path to validate data readiness and launch the live operational pilot.`,
  });

  const steps = (pitchPlan.next_steps || []).slice(0, 3);
  steps.forEach((st, idx) => {
    const y = 1.6 + idx * 1.55;
    slide.addShape("roundRect", {
      x: MARGIN, y, w: 12.48, h: 1.35, rectRadius: 0.08,
      fill: { color: palette.card }, line: { color: idx === 0 ? palette.accent : palette.cardBorder, width: 1.5 },
    });
    slide.addText(st.num, {
      x: MARGIN + 0.25, y: y + 0.25, w: 0.8, h: 0.5,
      fontSize: 24, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    slide.addText(st.title, {
      x: MARGIN + 1.1, y: y + 0.25, w: 10.8, h: 0.35,
      fontSize: 16, bold: true, color: palette.heading, fontFace: palette.fontTitle,
    });
    slide.addText(st.desc, {
      x: MARGIN + 1.1, y: y + 0.62, w: 10.8, h: 0.6,
      fontSize: 11, color: "CBD5E1", fontFace: palette.fontBody, wrap: true,
    });
  });

  slide.addShape("roundRect", {
    x: MARGIN, y: 6.15, w: 12.48, h: 0.65, rectRadius: 0.06,
    fill: { color: "0B1220" }, line: { color: "0E7C66", width: 1.5 },
  });
  slide.addText(`READY TO BEGIN:  Apexon Solution Architecture Team  ·  Contact: solutions@apexon.com`, {
    x: MARGIN + 0.2, y: 6.32, w: 12.08, h: 0.3,
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

  // Slide 7: Live Operations Command Center
  {
    const slide = pres.addSlide();
    addCommandCenterSlide(slide, palette, { companyName, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 8: Explainable AI Decision Engine
  {
    const slide = pres.addSlide();
    addExplainableSlide(slide, palette, { pitchPlan: plan, page });
    page += 1;
  }

  // Slide 9: Customer Behavioral Profiling
  {
    const slide = pres.addSlide();
    addBehavioralSlide(slide, palette, { pitchPlan: plan, page });
    page += 1;
  }

  // Slide 10: Investigation Prioritization Queue
  {
    const slide = pres.addSlide();
    addQueueSlide(slide, palette, { companyName, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 11: Business Outcomes & Value Loop
  {
    const slide = pres.addSlide();
    addOutcomesSlide(slide, palette, { companyName, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 12: Technical Data Readiness Matrix
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

  // Slide 14: Next Steps & Immediate Engagement Plan
  {
    const slide = pres.addSlide();
    addNextStepsSlide(slide, palette, { companyName, pitchPlan: plan, page });
    page += 1;
  }

  await pres.writeFile({ fileName: finalPath });
  return finalPath;
}
