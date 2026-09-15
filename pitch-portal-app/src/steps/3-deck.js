// 3-deck.js — 14-Slide Requirement-Centric Executive Deck on Apexon Brand Chrome
// Structure: Title → Agenda → Challenges → Solution Vision → Data Foundation → Fabric Architecture →
// Command Center → Explainable AI Breakdown → Behavioral Profiling → Investigation Queue → Business Outcomes →
// Data Readiness Matrix → Delivery Roadmap → Next Steps.

import fs from "fs";
import path from "path";
import pptxgen from "pptxgenjs";
import { toLabel, fitLine, fitTitle } from "../lib/text.js";
import { getPalette } from "../lib/palette.js";
import { slugify } from "../lib/slugify.js";
import { LOGO_PATH, MASTER_BG_PATH } from "../lib/templateTheme.js";
import { platformFromRequirement } from "../lib/briefFirst.js";
import { findSectorPlaybook } from "../lib/knowledge/ragRetriever.js";
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
  slide.addText(truncate(kicker.toUpperCase(), 48), {
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
function addTitleSlide(slide, palette, { companyName, domain, pitchPlan, platformName, page }) {
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

  slide.addText(`${pptSafe(companyName).toUpperCase()}  ×  ${pptSafe(platformName).toUpperCase()}`, {
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
    `A strategic blueprint for ${pptSafe(companyName)} leadership to eliminate operational blind spots, connect daily transaction feeds, and empower frontline teams with explainable AI decisions.`,
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

  const sections = [
    { num: "01", title: "Operational Problem", desc: `Why delayed signals and manual triage create business blind spots` },
    { num: "02", title: "Solution Vision", desc: "How a unified operational platform unifies data feeds into real-time action" },
    { num: "03", title: "Data Foundation", desc: "Connecting existing transaction, customer, and device feeds without disruption" },
    { num: "04", title: "Architecture Overview", desc: "A simple, secure, and governed flow powered by Microsoft Fabric" },
    { num: "05", title: "Live Command Center", desc: "Real-time event stream monitoring, risk classification, and operational gauges" },
    { num: "06", title: "Explainable AI Decision Engine", desc: "How AI scores event risk factors transparently for frontline teams" },
    { num: "07", title: "Investigation Prioritization & Outcomes", desc: "Automated queue triage, data readiness matrix, and phased delivery roadmap" },
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
  addSectionHeader(slide, palette, {
    kicker: "CURRENT OPERATIONAL CHALLENGES",
    title: `Siloed Data Slows Down ${pitchPlan.primary_business_domain}`,
    subtitle: `${companyName} generates valuable operational signals every minute, but disconnected tools force staff into reactive firefighting.`,
  });

  const challenges = [
    { title: "Delayed Detection Latency", desc: "Critical anomalies and suspicious events are identified hours or days after occurrence, after financial or operational loss is already locked in." },
    { title: "High False Positive Friction", desc: "Rigid static threshold rules flood operating queues with benign alerts, wasting analyst capacity and frustrating legitimate customers." },
    { title: "Fragmented Data Systems", desc: "Frontline teams must manually cross-reference 4+ disconnected platforms (core ledgers, auth logs, CRM, webhooks) to investigate a single incident." },
    { title: "Lack of Explainable AI", desc: "Legacy black-box scoring fails to show why an event was flagged, making it difficult for investigators to take confident, rapid action." },
    { title: "Manual Investigation Backlog", desc: "Unprioritized work queues force analysts to treat all alerts equally, allowing high-risk, high-urgency incidents to sit unresolved." },
    { title: "Absence of Closed-Loop Learning", desc: "Investigator resolutions and customer feedback are not automatically fed back into models, causing the same false alarms to repeat indefinitely." },
  ];

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
    slide.addText(ch.title, {
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
function addSolutionVisionSlide(slide, palette, { companyName, pitchPlan, platformName, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "THE SOLUTION VISION",
    title: `One Unified ${pitchPlan.primary_business_domain} Operating Hub`,
    subtitle: `${platformName} connects daily operational systems into a single, real-time operating hub for ${companyName}.`,
  });

  const stages = [
    { num: "01", step: "Connect", desc: `Securely link transaction feeds, device signals, and customer histories in real time (<50ms) without disrupting daily operations.`, color: "1D6EE4" },
    { num: "02", step: "Unify", desc: `Organize all operational data into a single OneLake source of truth with governed feature stores and behavioral baselines.`, color: "0E7C66" },
    { num: "03", step: "Predict & Score", desc: `Run transparent AI models to evaluate composite risk scores (0–100) and pinpoint exact anomaly drivers instantly.`, color: "6366F1" },
    { num: "04", step: "Empower & Act", desc: `Deliver real-time command dashboards, automated workflow triggers, and prioritized work queues directly to investigators.`, color: "E54A24" },
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
  slide.addText(`TARGET OUTCOMES:  ${outcomes || "Sub-Second Scoring  ·  Lower False Positives  ·  3x Faster Triage  ·  Zero Unmitigated Losses"}`, {
    x: MARGIN + 0.2, y: 5.95, w: 12.08, h: 0.35,
    fontSize: 11, bold: true, color: palette.textLight, fontFace: palette.fontTitle, align: "center",
  });
}

// Slide 5: Data Foundation
function addDataFoundationSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "DATA FOUNDATION",
    title: `${companyName} Data Foundation for ${pitchPlan.primary_business_domain}`,
    subtitle: `Connecting the exact operational feeds, device signals, and historical records needed to power real-time AI.`,
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
    slide.addText(feed.category, {
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
function addArchitectureSlide(slide, palette, { companyName, pitchPlan, platformName, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "SOLUTION ARCHITECTURE",
    title: `How ${platformName} Powers Real-Time ${pitchPlan.primary_business_domain}`,
    subtitle: `An end-to-end governed pipeline from real-time event streaming to automated frontline action.`,
  });

  const tiers = [
    { title: "1. Event Ingestion", subtitle: "Fabric Eventstream", items: ["Card / UPI / IMPS Switch", "Mobile & Web Device Telemetry", "Terminal & GPS Location Feeds", "Core Ledger Change Data Capture"] },
    { title: "2. Unified Storage", subtitle: "OneLake & Delta Parquet", items: ["12-Month Behavioral History", "Customer 360 Feature Store", "Device Fingerprint Repository", "Historical Confirmed Outcomes"] },
    { title: "3. Real-Time Analytics", subtitle: "KQL Real-Time Database", items: ["Sub-50ms Stream Processing", "Velocity & Amount Aggregations", "Geographic Displacement Check", "Rule Filter & Anomaly Radar"] },
    { title: "4. AI Scoring Engine", subtitle: "Fabric Machine Learning", items: ["Composite Risk Score (0–100)", "Transparent Feature Weights", "Behavioral Outlier Classifier", "Action Decision Engine"] },
    { title: "5. Frontline Action", subtitle: "Power BI & Automated Router", items: ["Instant Approve / Challenge / Block", "Prioritized Analyst Work Queue", "One-Click Evidence Dossier", "Teams & SMS Alert Dispatch"] },
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
    tier.items.forEach((item, iIdx) => {
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
  addSectionHeader(slide, palette, {
    kicker: "OPERATIONAL CAPABILITY 1 OF 5  |  COMMAND RADAR",
    title: `${companyName} Live Operations Command Center`,
    subtitle: `Continuous sub-second evaluation of incoming operational streams with instant anomaly risk classification.`,
  });

  const isHealth = (pitchPlan.sector || "").toLowerCase().includes("health") || 
                   (pitchPlan.primary_business_domain || "").toLowerCase().includes("bed") || 
                   (pitchPlan.primary_business_domain || "").toLowerCase().includes("patient");

  // Top metric bar (4 summary KPIs)
  const metrics = isHealth ? [
    { label: "Today's Monitored Encounters", val: "1,280 Patients", note: "< 45 ms stream latency" },
    { label: "Priority Discharges Flagged", val: "42 Beds", note: "100% routed to priority EVS" },
    { label: "ED Boarding Hours Averted", val: "185 Hours", note: "Zero transfer delays" },
    { label: "Average Bed Turnaround Time", val: "38 min", note: "Well below 45 min target" },
  ] : [
    { label: "Today's Evaluated Events", val: "1,420,850", note: "< 45 ms avg latency" },
    { label: "Critical Anomalies Intercepted", val: "48 Events", note: "100% routed to priority queue" },
    { label: "Direct Loss Prevented Today", val: "₹1.42 Cr", note: "Zero customer friction" },
    { label: "Current Active False Positive Rate", val: "0.82%", note: "Well below 1.5% target" },
  ];

  metrics.forEach((m, idx) => {
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

  const headers = isHealth 
    ? ["Event Ref", "Patient Unit / Room", "Channel & Device", "Hospital Location", "Status / Transfer", "Risk Score", "Recommended Action"]
    : ["Event ID", "Account / Entity", "Channel & Device", "Location Signal", "Amount", "Risk Score", "Decision Action"];
  const colW = [1.5, 2.0, 2.2, 2.0, 1.4, 1.3, 1.88];
  
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
    
    const channel = isHealth ? "Nurse Station / ADT Feed" : "Mobile App (iOS 18)";
    const location = isHealth 
      ? (r.priority === "CRITICAL" ? "ED Inpatient Tower" : "Wing B Telemetry")
      : (r.priority === "CRITICAL" ? "Dubai (Foreign IP)" : "Hyderabad (Domestic)");

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
  const ex = pitchPlan.explainable_example || {
    txnId: "TXN-89421",
    amount: "₹1,85,000",
    riskScore: 92,
    riskLevel: "CRITICAL RISK",
    decision: "CHALLENGE & ROUTE TO PRIORITY QUEUE",
    factors: [
      { factor: "Unrecognized Device Signature", weight: "+28", reason: "First authorization on this device ID" },
      { factor: "Impossible Travel / Geo Anomaly", weight: "+32", reason: "Physical distance 2,500 km in 45 min" },
      { factor: "High Transaction Value Outlier", weight: "+18", reason: "14x higher than 90-day average spend" },
      { factor: "Off-Peak Time Window", weight: "+14", reason: "Attempt occurred at 02:37 AM" }
    ]
  };

  addSectionHeader(slide, palette, {
    kicker: "OPERATIONAL CAPABILITY 2 OF 5  |  TRANSPARENT AI",
    title: "Why Did the AI Model Flag This Incident?",
    subtitle: "Every automated decision provides an instant, transparent breakdown of risk factors for frontline analysts.",
  });

  // Left Card: The Incident Profile
  const leftX = MARGIN;
  slide.addShape("roundRect", {
    x: leftX, y: 1.6, w: 4.8, h: 4.8, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "E54A24", width: 1.5 },
  });
  slide.addText("INSPECTED EVENT DOSSIER", {
    x: leftX + 0.25, y: 1.8, w: 4.3, h: 0.28,
    fontSize: 11, bold: true, color: "FF7A59", fontFace: palette.fontTitle,
  });
  slide.addText(`Event Ref: ${ex.txnId}`, {
    x: leftX + 0.25, y: 2.15, w: 4.3, h: 0.38,
    fontSize: 18, bold: true, color: palette.heading, fontFace: palette.fontTitle,
  });

  const details = [
    { label: "Transaction Value", val: ex.amount },
    { label: "Channel & Timestamp", val: `${ex.channel || "Mobile App"} · ${ex.timestamp || "02:37 AM"}` },
    { label: "Observed Location", val: `${ex.location || "Foreign Node"} (Baseline: ${ex.baselineLocation || "Domestic"})` },
    { label: "Observed Device", val: `${ex.device || "New Device"} (Baseline: ${ex.baselineDevice || "Registered"})` },
    { label: "Composite AI Risk Score", val: `${ex.riskScore} / 100 (${ex.riskLevel})` },
    { label: "Recommended AI Action", val: ex.decision },
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
  slide.addText("TRANSPARENT RISK FACTOR DECOMPOSITION", {
    x: rightX + 0.25, y: 1.8, w: 6.88, h: 0.28,
    fontSize: 11, bold: true, color: palette.accent, fontFace: palette.fontTitle,
  });

  ex.factors.forEach((f, fIdx) => {
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
  const bp = pitchPlan.behavioral_profile || {
    entityName: "High-Volume Account Profile",
    baseline: [{ dimension: "Location", value: "Domestic Baseline", status: "Baseline" }],
    anomaly: [{ dimension: "Location", value: "Foreign Node Deviation", status: "Anomaly" }],
    conclusion: "Behavioral model detects significant multi-dimensional deviation from established profile."
  };

  addSectionHeader(slide, palette, {
    kicker: "OPERATIONAL CAPABILITY 3 OF 5  |  BEHAVIORAL INTELLIGENCE",
    title: "Multi-Dimensional Behavioral Baseline vs. Anomaly",
    subtitle: `Continuous machine learning compares every event against 12 months of individual customer history.`,
  });

  // Left Box: 12-Month Baseline Profile
  const leftX = MARGIN;
  slide.addShape("roundRect", {
    x: leftX, y: 1.6, w: 5.9, h: 4.1, rectRadius: 0.08,
    fill: { color: palette.card }, line: { color: "0E7C66", width: 1.5 },
  });
  slide.addText("ESTABLISHED 12-MONTH BASELINE PROFILE", {
    x: leftX + 0.25, y: 1.8, w: 5.4, h: 0.28,
    fontSize: 11, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
  });

  bp.baseline.forEach((b, idx) => {
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
  slide.addText("CURRENT ANOMALOUS EVENT DEVIATION", {
    x: rightX + 0.25, y: 1.8, w: 5.68, h: 0.28,
    fontSize: 11, bold: true, color: "FF7A59", fontFace: palette.fontTitle,
  });

  bp.anomaly.forEach((a, idx) => {
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
  slide.addText(`AI PROFILE VERDICT:  ${bp.conclusion}`, {
    x: MARGIN + 0.3, y: 6.08, w: 11.88, h: 0.3,
    fontSize: 11, bold: true, color: palette.heading, fontFace: palette.fontTitle, align: "center",
  });
}

// Slide 10: Investigation Prioritization Queue
function addQueueSlide(slide, palette, { companyName, pitchPlan, page }) {
  applyMaster(slide, palette, { page });
  addSectionHeader(slide, palette, {
    kicker: "OPERATIONAL CAPABILITY 4 OF 5  |  INVESTIGATION QUEUE",
    title: "AI-Prioritized Case Triage & Investigator Workflow",
    subtitle: `High-risk incidents are ranked Critical/High with pre-assembled dossiers so analysts act in seconds.`,
  });

  const headers = ["Priority Tier", "Case Ref", "Customer / Entity", "Exposure Amount", "Primary Risk Trigger", "One-Click Investigator Action"];
  const colW = [1.8, 1.4, 1.8, 1.6, 3.4, 2.48];
  
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
  addSectionHeader(slide, palette, {
    kicker: "OPERATIONAL CAPABILITY 5 OF 5  |  BUSINESS OUTCOMES",
    title: `Measurable Solution Performance for ${companyName}`,
    subtitle: `Projected operational benchmarks tailored specifically to ${pitchPlan.primary_business_domain}.`,
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
  slide.addText("CLOSED-LOOP CONTINUOUS LEARNING ARCHITECTURE", {
    x: MARGIN + 0.3, y: loopY + 0.18, w: 11.88, h: 0.28,
    fontSize: 12, bold: true, color: "7DDEA0", fontFace: palette.fontTitle,
  });

  const loopSteps = [
    { title: "1. Real-Time Scoring", desc: "Live event stream evaluated against ML feature store in <60ms." },
    { title: "2. Priority Routing", desc: "High-risk alerts instantly routed to analyst queue with explainable factors." },
    { title: "3. Investigator Decision", desc: "Analyst confirms or dismisses case with 1-click evidence dossier." },
    { title: "4. Automated Model Update", desc: "Outcome fed back to OneLake to continuously reduce future false positives." },
  ];

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
  addSectionHeader(slide, palette, {
    kicker: "DATA READINESS & DISCOVERY MATRIX",
    title: "Fast-Track Integration & Feasibility Assessment",
    subtitle: `All required data feeds connect to existing enterprise infrastructure without requiring system replacements.`,
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
      "To be validated during discovery"
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
  addSectionHeader(slide, palette, {
    kicker: "DELIVERY ROADMAP",
    title: "A Phased Path from Fast Pilot to Enterprise Scale",
    subtitle: `A structured milestone plan delivering live operational value across ${companyName} within 8 weeks.`,
  });

  const domainFocus = pitchPlan.primary_business_domain || "Operations";
  const phases = [
    { title: "1. Setup & Data Discovery", time: "Weeks 1–6", items: ["Stand up secure Fabric workspace & OneLake", "Connect primary real-time eventstream", "Validate source fields and data quality", "Establish role-based governance & security"] },
    { title: "2. Quick-Win Pilot", time: "Weeks 6–12", items: [`Launch live ${domainFocus} Pilot`, "Deploy explainable AI scoring model", "Test real-time investigation queue with analysts", "Measure baseline loss reduction & false positive rate"] },
    { title: "3. Enterprise Scale", time: "Months 3–6", items: ["Scale streaming to 100% of transaction channels", "Integrate automated challenge/MFA webhooks", "Deploy mobile alerts & Teams bot dispatch", "Establish continuous retraining feature store"] },
    { title: "4. Continuous Value", time: "Months 6+", items: ["Expand behavioral models across all business units", "Automate cross-channel intelligence sharing", "Benchmark enterprise-wide ROI with executive board"] },
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
      x: x + 0.18, y: y + 0.2, w: 2.58, h: 0.42,
      fontSize: 14, bold: true, color: palette.heading, fontFace: palette.fontTitle, wrap: true,
    });
    slide.addText(ph.time, {
      x: x + 0.18, y: y + 0.65, w: 2.58, h: 0.28,
      fontSize: 12, bold: true, color: palette.accent, fontFace: palette.fontTitle,
    });
    ph.items.forEach((item, iIdx) => {
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
  addSectionHeader(slide, palette, {
    kicker: "NEXT STEPS & ENGAGEMENT PLAN",
    title: `Next Steps to Initiate Discovery for ${companyName}`,
    subtitle: `A collaborative 3-step path to validate data readiness and launch the live operational pilot.`,
  });

  const steps = [
    { num: "01", title: "3-Week Technical Discovery & Data Audit", desc: "Collaborate with your enterprise data & engineering teams to review sample event streams, schemas, API gateways, and governance requirements." },
    { num: "02", title: "Baseline Measurement & KPI Definition", desc: "Jointly establish current baseline metrics (false positive rate, decision latency, investigation time) and confirm target success thresholds." },
    { num: "03", title: "8-Week Rapid Production Pilot Deployment", desc: "Deploy the Microsoft Fabric command center in your environment, connected to live streams, with active triage workflows for operating teams." },
  ];

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
  const platformName = platform.name === "Operating platform" ? "Microsoft Fabric" : platform.name;
  
  // Build or use provided pitchPlan
  const plan = pitchPlan || buildPitchPlan({ companyName, domain, requirement });

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Apexon";
  pres.title = `${pptSafe(companyName)} — ${pptSafe(plan.primary_business_domain)}`;
  pres.subject = pptSafe(`${companyName} — ${requirement}`);

  let page = 1;

  // Slide 1: Cover
  {
    const slide = pres.addSlide();
    addTitleSlide(slide, palette, { companyName, domain, pitchPlan: plan, platformName, page });
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
    addSolutionVisionSlide(slide, palette, { companyName, pitchPlan: plan, platformName, page });
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
    addArchitectureSlide(slide, palette, { companyName, pitchPlan: plan, platformName, page });
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
