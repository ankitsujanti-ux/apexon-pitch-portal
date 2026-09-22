// 3-deck.js — 14-Slide Executive Boardroom Pitch Deck with Apexon Logo on Every Slide
// Clean, modern, consulting-grade layout without rigid template artifacts or vendor bias.
// Structure:
// 01. Cover Slide (Executive Briefing & Strategic Title)
// 02. Agenda (What We'll Cover — 7 Structured Sections)
// 03. The Challenge (Fragmented Data Is Slowing Operations — 3 Strategic Pain Cards)
// 04. The Solution (One Unified Data & AI Operations Platform — 4-Stage Pipeline + Outcomes)
// 05. Data Landscape (Data Domains, One Governed Lakehouse — Domain Cards + Governance)
// 06. Technical Architecture (Enterprise Data & AI Reference Architecture — 5-Layer End-to-End Diagram)
// 07–11. Priority Use Cases 1 to 5 (Problem, Solution Approach, Data Sources, Platform Tech, 3 Stat Cards)
// 12. Technical Feasibility Matrix (5-Row Table: Readiness, Complexity, Time-to-Value, Feasibility Notes)
// 13. Implementation Roadmap (4 Phased Milestones: Foundation, Pilot, Scale, Optimize)
// 14. Expected Impact & Next Steps (4 Executive Stat Cards + 3 Actionable Engagement Steps)

import fs from "fs";
import path from "path";
import pptxgen from "pptxgenjs";
import { toLabel, fitLine, fitTitle, toSentences } from "../lib/text.js";
import { getPalette } from "../lib/palette.js";
import { slugify } from "../lib/slugify.js";
import { LOGO_PATH } from "../lib/templateTheme.js";
import { platformFromRequirement } from "../lib/briefFirst.js";
import { buildPitchPlan } from "../lib/pitchStrategist.js";

const SLIDE_W = 13.33;
const SLIDE_H = 7.5;
const MARGIN = 0.5;
const LOGO_ASPECT = 192 / 53; // ~3.62

// Clean executive dark theme colors
const THEME = {
  bg: "0B1220",
  card: "0F1D38",
  cardInner: "070C16",
  cardBorder: "1D3557",
  cardBorderSubtle: "162544",
  accent: "00D2FF",       // Vibrant Cyan
  accentOrange: "E54A24", // Apexon Orange
  accentGreen: "10B981",  // Emerald Green
  accentAmber: "F59E0B",  // Warm Amber
  textPrimary: "FFFFFF",
  textHeading: "8EC8FF",  // Light Blue Heading
  textMuted: "CBD5E1",    // Slate Light
  textDim: "94A3B8",      // Slate Dim
  fontTitle: "Arial",
  fontBody: "Helvetica",
};

function pptSafe(text) {
  return String(text || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2192/g, "->")
    .replace(/\u2191/g, "+")
    .replace(/\u2193/g, "-")
    .replace(/\u20b9/g, "INR ")
    .replace(/\u2026/g, "...")
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text, maxChars = 600) {
  const safe = pptSafe(text);
  if (!maxChars || safe.length <= maxChars) return safe;
  return toSentences(safe, maxChars);
}

// Draw brand logo on any slide
function addBrandLogo(slide, { x, y, h }) {
  if (fs.existsSync(LOGO_PATH)) {
    const w = h * LOGO_ASPECT;
    slide.addImage({ path: LOGO_PATH, x, y, w, h });
    return w;
  }
  const w = h * LOGO_ASPECT;
  slide.addText("APEXON", {
    x,
    y,
    w,
    h,
    fontSize: 12,
    bold: true,
    color: THEME.textPrimary,
    fontFace: THEME.fontTitle,
  });
  return w;
}

// Master slide background & footer with Apexon Logo on EVERY slide
function applyMaster(slide, palette, { companyName, domain, page, isCover = false }) {
  // Deep clean executive dark background
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: SLIDE_H,
    fill: { color: THEME.bg },
    line: { color: THEME.bg },
  });

  // Top accent bar
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: 0.05,
    fill: { color: isCover ? THEME.accentOrange : THEME.accent },
    line: { color: isCover ? THEME.accentOrange : THEME.accent },
  });

  if (!isCover) {
    // Header Logo in Top Right for internal slides
    addBrandLogo(slide, { x: SLIDE_W - MARGIN - 1.45, y: 0.35, h: 0.32 });

    // Clean Executive Footer
    const footerY = 7.15;
    const footerText = `${pptSafe(companyName)}  ·  ${pptSafe(domain)} Modernization`;
    slide.addText(footerText, {
      x: MARGIN,
      y: footerY,
      w: 8.0,
      h: 0.22,
      fontSize: 9.5,
      color: THEME.textDim,
      fontFace: THEME.fontBody,
    });

    slide.addText(`${page} / 14`, {
      x: SLIDE_W - MARGIN - 1.2,
      y: footerY,
      w: 1.2,
      h: 0.22,
      fontSize: 9.5,
      bold: true,
      color: THEME.textDim,
      fontFace: THEME.fontBody,
      align: "right",
    });
  }
}

// Standardized slide header
function addSectionHeader(slide, palette, { kicker, title, subtitle }) {
  slide.addText(pptSafe(kicker.toUpperCase()), {
    x: MARGIN,
    y: 0.38,
    w: 9.8,
    h: 0.26,
    fontSize: 10.5,
    bold: true,
    color: THEME.accent,
    fontFace: THEME.fontTitle,
  });
  slide.addText(pptSafe(title), {
    x: MARGIN,
    y: 0.65,
    w: 9.8,
    h: 0.45,
    fontSize: 22,
    bold: true,
    color: THEME.textHeading,
    fontFace: THEME.fontTitle,
  });
  if (subtitle) {
    slide.addText(pptSafe(subtitle), {
      x: MARGIN,
      y: 1.12,
      w: 12.33,
      h: 0.38,
      fontSize: 11.5,
      color: THEME.textMuted,
      fontFace: THEME.fontBody,
      wrap: true,
    });
  }
}

// ==========================================
// Slide 1: Cover Slide
// ==========================================
function addTitleSlide(slide, palette, { companyName, domain, pitchPlan, platformName, requirement, page }) {
  applyMaster(slide, palette, { companyName, domain, page, isCover: true });

  // Prominent Apexon Logo on Top Right
  addBrandLogo(slide, { x: SLIDE_W - MARGIN - 2.2, y: 0.65, h: 0.55 });

  // Top Kicker — Completely clean & vendor-neutral
  const kicker = `${pptSafe(companyName).toUpperCase()}  ·  STRATEGIC PROPOSAL`;
  slide.addText(kicker, {
    x: MARGIN,
    y: 0.85,
    w: 9.0,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: THEME.accent,
    fontFace: THEME.fontTitle,
  });

  let domainFocus = pitchPlan.primary_business_domain || `${domain} Operations`;
  const compCleanRegex = new RegExp(`^${companyName}['s]*\\s*`, 'i');
  domainFocus = domainFocus.replace(compCleanRegex, "").trim();

  // If domainFocus is a slogan, tactical requirement, or very short, formulate a proper executive domain title
  if (/^win the bed|cut the|reduce|optimize|improve|detect|lower|eliminate|real-time payment/i.test(domainFocus) || domainFocus.length < 5) {
    if (/health|hospital|clinical|bed/i.test(domain + " " + requirement)) {
      domainFocus = "Hospital Operations & Patient Flow";
    } else if (/bank|fraud|payment|financial/i.test(domain + " " + requirement)) {
      domainFocus = "Enterprise Fraud Detection & Risk Intelligence";
    } else if (/retail|inventory|store/i.test(domain + " " + requirement)) {
      domainFocus = "Omnichannel Inventory & Demand Fulfillment";
    } else if (/manufactur|quality|assembly|plant/i.test(domain + " " + requirement)) {
      domainFocus = "Smart Manufacturing & Operations Quality";
    } else {
      domainFocus = `${domain} Operations Modernization`;
    }
  }

  let mainTitle = `Transforming ${pptSafe(domainFocus)} with Real-Time Data and AI`;
  if (/^unifying|^transforming|^modernizing/i.test(domainFocus)) {
    mainTitle = `${pptSafe(domainFocus)} with Real-Time Data and AI`;
  }

  // Hero Title
  slide.addText(mainTitle, {
    x: MARGIN,
    y: 1.75,
    w: 11.5,
    h: 1.6,
    fontSize: 34,
    bold: true,
    color: THEME.textPrimary,
    fontFace: THEME.fontTitle,
    wrap: true,
  });

  // Subtitle
  slide.addText(
    `A data-driven blueprint to eliminate operational blind spots, connect live telemetry feeds, and empower frontline teams with real-time AI intelligence across ${pptSafe(companyName)}.`,
    {
      x: MARGIN,
      y: 3.55,
      w: 11.8,
      h: 0.95,
      fontSize: 15,
      color: THEME.textMuted,
      fontFace: THEME.fontBody,
      wrap: true,
    }
  );

  // Metadata Card
  slide.addShape("roundRect", {
    x: MARGIN,
    y: 4.85,
    w: 12.33,
    h: 0.85,
    rectRadius: 0.06,
    fill: { color: THEME.card },
    line: { color: THEME.cardBorder, width: 1 },
  });
  slide.addText(`Prepared for: ${pptSafe(companyName)}   |   Sector: ${pptSafe(domain)}   |   Demo Briefing`, {
    x: MARGIN + 0.3,
    y: 5.12,
    w: 11.5,
    h: 0.32,
    fontSize: 12.5,
    bold: true,
    color: THEME.textHeading,
    fontFace: THEME.fontTitle,
  });

  // Footer Tagline
  slide.addText("Confidential — Executive Solution Proposal  ·  Apexon Solutions Architecture", {
    x: MARGIN,
    y: 6.85,
    w: 10.0,
    h: 0.25,
    fontSize: 10,
    color: THEME.textDim,
    fontFace: THEME.fontBody,
  });
}

// ==========================================
// Slide 2: Agenda
// ==========================================
function addAgendaSlide(slide, palette, { companyName, domain, pitchPlan, page }) {
  applyMaster(slide, palette, { companyName, domain, page });
  addSectionHeader(slide, palette, {
    kicker: "AGENDA",
    title: "What We'll Cover",
    subtitle: `A structured executive walkthrough tailored to ${pptSafe(companyName)}'s operational priorities and business value.`,
  });

  const domainName = pitchPlan.primary_business_domain || domain;
  const sections = [
    { num: "01", title: "Operational Challenges", desc: `Where fragmented data and manual triage slow ${pptSafe(domainName).toLowerCase()} operations today` },
    { num: "02", title: "Solution Vision", desc: `A unified real-time data & AI operational platform delivering sub-second intelligence` },
    { num: "03", title: "Data Landscape", desc: `Bringing core operational feeds, telemetry, and historical records together into a governed lakehouse` },
    { num: "04", title: "Reference Architecture", desc: `How modern data & AI pipelines ingest, unify, analyze, and activate real-time action across systems` },
    { num: "05", title: "Priority Use Cases", desc: `Five high-impact, demo-ready operational scenarios tailored to ${pptSafe(companyName)}` },
    { num: "06", title: "Technical Feasibility", desc: `Effort, data readiness, complexity, and non-disruptive integration for each use case` },
    { num: "07", title: "Roadmap & Expected Impact", desc: `Phased 4-stage delivery timeline and measurable network-wide ROI metrics` },
  ];

  sections.forEach((sec, idx) => {
    const col = idx < 4 ? 0 : 1;
    const row = idx < 4 ? idx : idx - 4;
    const x = MARGIN + col * 6.32;
    const y = 1.62 + row * 1.25;

    slide.addShape("roundRect", {
      x, y, w: 5.95, h: 1.1, rectRadius: 0.06,
      fill: { color: THEME.card },
      line: { color: THEME.cardBorder, width: 1 },
    });
    slide.addText(sec.num, {
      x: x + 0.2, y: y + 0.16, w: 0.6, h: 0.3,
      fontSize: 16, bold: true, color: THEME.accent, fontFace: THEME.fontTitle,
    });
    slide.addText(sec.title, {
      x: x + 0.8, y: y + 0.16, w: 4.95, h: 0.3,
      fontSize: 13.5, bold: true, color: THEME.textHeading, fontFace: THEME.fontTitle,
    });
    slide.addText(sec.desc, {
      x: x + 0.8, y: y + 0.48, w: 4.95, h: 0.52,
      fontSize: 10.5, color: THEME.textMuted, fontFace: THEME.fontBody, wrap: true,
    });
  });
}

// ==========================================
// Slide 3: The Challenge
// ==========================================
function addChallengesSlide(slide, palette, { companyName, domain, pitchPlan, page }) {
  applyMaster(slide, palette, { companyName, domain, page });
  const cm = pitchPlan.challenges_meta || {};
  addSectionHeader(slide, palette, {
    kicker: cm.kicker || "THE CHALLENGE",
    title: cm.title || `Fragmented Data Is Slowing ${pitchPlan.primary_business_domain || domain} Operations`,
    subtitle: cm.subtitle || `${pptSafe(companyName)}'s scale generates vast operational data every minute — but disconnected systems force teams into reactive firefighting.`,
  });

  const challenges = (pitchPlan.operational_challenges && pitchPlan.operational_challenges.length >= 3)
    ? pitchPlan.operational_challenges.slice(0, 3)
    : [
        { title: "Data Silos & Delayed Ingestion", desc: `Operational feeds live in disparate systems with batch delays, leaving leadership without a real-time consolidated picture across units.` },
        { title: "Reactive Anomaly Detection", desc: `Frontline operators detect critical bottlenecks or fraud patterns only after operational friction or financial losses have already occurred.` },
        { title: "High Manual Investigation Burden", desc: `Analysts and managers spend excessive time manually gathering data across multiple tools rather than taking immediate corrective action.` },
      ];

  challenges.forEach((ch, idx) => {
    const x = MARGIN + idx * 4.22;
    const y = 1.65;

    slide.addShape("roundRect", {
      x, y, w: 3.98, h: 4.8, rectRadius: 0.08,
      fill: { color: THEME.card },
      line: { color: THEME.cardBorder, width: 1 },
    });
    slide.addText(`0${idx + 1}`, {
      x: x + 0.25, y: y + 0.25, w: 0.8, h: 0.35,
      fontSize: 22, bold: true, color: THEME.accent, fontFace: THEME.fontTitle,
    });
    slide.addText(ch.title, {
      x: x + 0.25, y: y + 0.75, w: 3.48, h: 0.7,
      fontSize: 15, bold: true, color: THEME.textHeading, fontFace: THEME.fontTitle, wrap: true,
    });
    slide.addText(ch.desc, {
      x: x + 0.25, y: y + 1.6, w: 3.48, h: 2.8,
      fontSize: 12, color: THEME.textMuted, fontFace: THEME.fontBody, wrap: true,
    });
  });
}

// ==========================================
// Slide 4: The Solution
// ==========================================
function addSolutionVisionSlide(slide, palette, { companyName, domain, pitchPlan, page }) {
  applyMaster(slide, palette, { companyName, domain, page });
  const vm = pitchPlan.vision_meta || {};
  addSectionHeader(slide, palette, {
    kicker: vm.kicker || "THE SOLUTION",
    title: vm.title || "One Unified Data & AI Operations Platform",
    subtitle: vm.subtitle || `Modern enterprise data architecture brings operational, telemetry, and transactional data into a single governed lakehouse with real-time AI intelligence.`,
  });

  const stages = (pitchPlan.vision_stages && pitchPlan.vision_stages.length === 4)
    ? pitchPlan.vision_stages
    : [
        { num: "01", step: "Ingest", desc: `Stream operational feeds, transactions, and IoT telemetry the instant events occur with sub-second latency.`, color: THEME.accent },
        { num: "02", step: "Correlate", desc: `Unified lakehouse storage connects disparate records into a single multi-domain operational source of truth.`, color: "38BDF8" },
        { num: "03", step: "Score & Detect", desc: `Transparent ML models evaluate risk scores in real time and pinpoint exact anomaly drivers instantly.`, color: THEME.accentGreen },
        { num: "04", step: "Prioritize & Act", desc: `Deliver live command dashboards, automated alerts, and prioritized queues directly to frontline teams.`, color: THEME.accentOrange },
      ];

  stages.forEach((st, idx) => {
    const x = MARGIN + idx * 3.16;
    const y = 1.65;
    slide.addShape("roundRect", {
      x, y, w: 2.94, h: 3.8, rectRadius: 0.08,
      fill: { color: THEME.card },
      line: { color: st.color || THEME.cardBorder, width: 1.5 },
    });
    slide.addText(st.num, {
      x: x + 0.2, y: y + 0.2, w: 0.6, h: 0.3,
      fontSize: 16, bold: true, color: st.color || THEME.accent, fontFace: THEME.fontTitle,
    });
    slide.addText(st.step, {
      x: x + 0.2, y: y + 0.65, w: 2.54, h: 0.45,
      fontSize: 18, bold: true, color: THEME.textPrimary, fontFace: THEME.fontTitle,
    });
    slide.addText(st.desc, {
      x: x + 0.2, y: y + 1.25, w: 2.54, h: 2.2,
      fontSize: 12, color: THEME.textMuted, fontFace: THEME.fontBody, wrap: true,
    });
  });

  // Outcome banner
  const outcomes = (pitchPlan.solution_kpis || []).map(k => k.name).join("  ·  ");
  slide.addShape("roundRect", {
    x: MARGIN, y: 5.65, w: 12.33, h: 0.95, rectRadius: 0.08,
    fill: { color: THEME.cardInner }, line: { color: THEME.accent, width: 1 },
  });
  slide.addText(`Outcome:  ${outcomes || "Sub-Second Evaluation  ·  Fewer False Positives  ·  3x Faster Triage  ·  Measurable Loss Reduction"}`, {
    x: MARGIN + 0.2, y: 5.95, w: 11.93, h: 0.35,
    fontSize: 11.5, bold: true, color: THEME.textPrimary, fontFace: THEME.fontTitle, align: "center",
  });
}

// ==========================================
// Slide 5: Data Landscape
// ==========================================
function addDataFoundationSlide(slide, palette, { companyName, domain, pitchPlan, page }) {
  applyMaster(slide, palette, { companyName, domain, page });
  const fdm = pitchPlan.data_foundation_meta || {};
  const feeds = (pitchPlan.data_foundation || []).slice(0, 3);
  const countLabel = feeds.length === 3 ? "Three" : feeds.length === 4 ? "Four" : "Multiple";
  
  addSectionHeader(slide, palette, {
    kicker: fdm.kicker || "DATA LANDSCAPE",
    title: fdm.title || `${countLabel} Data Domains, One Governed Lakehouse`,
    subtitle: fdm.subtitle || `Every domain lands in the unified lakehouse in its native form — no rip-and-replace of existing ${pptSafe(companyName)} systems.`,
  });

  const cardW = feeds.length === 3 ? 3.98 : 2.94;
  const spacing = feeds.length === 3 ? 4.22 : 3.16;

  feeds.forEach((feed, idx) => {
    const x = MARGIN + idx * spacing;
    const y = 1.65;
    slide.addShape("roundRect", {
      x, y, w: cardW, h: 4.15, rectRadius: 0.08,
      fill: { color: THEME.card },
      line: { color: THEME.cardBorder, width: 1 },
    });
    slide.addText(truncate(feed.category, 30), {
      x: x + 0.22, y: y + 0.2, w: cardW - 0.44, h: 0.4,
      fontSize: 15, bold: true, color: THEME.textHeading, fontFace: THEME.fontTitle, wrap: true,
    });
    slide.addText(feed.desc, {
      x: x + 0.22, y: y + 0.65, w: cardW - 0.44, h: 1.1,
      fontSize: 11, color: THEME.textMuted, fontFace: THEME.fontBody, wrap: true,
    });
    
    // System Badges Box
    slide.addShape("roundRect", {
      x: x + 0.2, y: y + 1.85, w: cardW - 0.4, h: 1.0, rectRadius: 0.06,
      fill: { color: THEME.cardInner }, line: { color: THEME.cardBorderSubtle, width: 1 },
    });
    slide.addText("PRIMARY SOURCES", {
      x: x + 0.3, y: y + 1.95, w: cardW - 0.6, h: 0.2,
      fontSize: 9, bold: true, color: THEME.accent, fontFace: THEME.fontTitle,
    });
    slide.addText(feed.sourceSystems || "Operational enterprise systems", {
      x: x + 0.3, y: y + 2.2, w: cardW - 0.6, h: 0.55,
      fontSize: 10.5, color: THEME.textPrimary, fontFace: THEME.fontBody, wrap: true,
    });

    // Fields Box
    slide.addShape("roundRect", {
      x: x + 0.2, y: y + 2.95, w: cardW - 0.4, h: 1.0, rectRadius: 0.06,
      fill: { color: THEME.cardInner }, line: { color: THEME.cardBorderSubtle, width: 1 },
    });
    slide.addText("KEY FIELDS & TELEMETRY", {
      x: x + 0.3, y: y + 3.05, w: cardW - 0.6, h: 0.2,
      fontSize: 9, bold: true, color: THEME.accentGreen, fontFace: THEME.fontTitle,
    });
    slide.addText(`${feed.fields}\nLatency: ${feed.frequency || "Real-time"}`, {
      x: x + 0.3, y: y + 3.3, w: cardW - 0.6, h: 0.55,
      fontSize: 9.5, color: THEME.textMuted, fontFace: THEME.fontBody, wrap: true,
    });
  });

  // Governance Banner
  slide.addShape("roundRect", {
    x: MARGIN, y: 5.95, w: 12.33, h: 0.75, rectRadius: 0.06,
    fill: { color: THEME.cardInner }, line: { color: THEME.cardBorder, width: 1 },
  });
  slide.addText(`Unified under enterprise data governance: role-based access control, PHI / PII data masking, and end-to-end audit trails across every domain`, {
    x: MARGIN + 0.2, y: 6.15, w: 11.93, h: 0.35,
    fontSize: 10.5, color: THEME.textMuted, fontFace: THEME.fontBody, align: "center",
  });
}

// ==========================================
// Slide 6: Technical Architecture
// ==========================================
function addArchitectureSlide(slide, palette, { companyName, domain, pitchPlan, page }) {
  applyMaster(slide, palette, { companyName, domain, page });
  const am = pitchPlan.architecture_meta || {};
  addSectionHeader(slide, palette, {
    kicker: am.kicker || "TECHNICAL ARCHITECTURE",
    title: am.title || "Enterprise Data & AI Reference Architecture",
    subtitle: am.subtitle || `An end-to-end governed pipeline from real-time stream ingestion to frontline decision intelligence.`,
  });

  const arch = pitchPlan.solution_architecture || {};
  const tiers = [
    arch.ingestion || { title: "Source Systems", subtitle: "Core Feeds & Streams", items: ["Core HIS / Banking", "Event Feeds (Kafka)", "Device & IoT Telemetry", "Audit & Logs"] },
    { title: "Ingestion Engine", subtitle: "Real-Time & Batch", items: ["Real-Time Event Streams", "Batch ETL Pipelines", "CDC Change Capture", "REST API Gateways"] },
    arch.storage || { title: "Unified Lakehouse", subtitle: "Delta Lake Storage", items: ["Bronze / Silver / Gold Layers", "Entity Feature Store", "12-Month History", "Governance & Catalog"] },
    arch.ai_layer || { title: "Analytics & AI", subtitle: "Real-Time & ML", items: ["Stream Processing Engine", "ML Anomaly Models", "Copilot AI Assistants", "Risk Scoring Engine"] },
    arch.action || { title: "Frontline Action", subtitle: "Applications & Queues", items: ["Operational Dashboards", "Automated Teams Alerts", "Prioritized Work Queues", "Clinician & Ops Apps"] },
  ];

  tiers.forEach((tier, idx) => {
    const x = MARGIN + idx * 2.49;
    const y = 1.65;
    slide.addShape("roundRect", {
      x, y, w: 2.32, h: 4.8, rectRadius: 0.08,
      fill: { color: THEME.card },
      line: { color: idx === 3 ? THEME.accent : THEME.cardBorder, width: idx === 3 ? 1.5 : 1 },
    });
    slide.addText(tier.title, {
      x: x + 0.1, y: y + 0.15, w: 2.12, h: 0.32,
      fontSize: 12.5, bold: true, color: THEME.textPrimary, fontFace: THEME.fontTitle, align: "center",
    });
    slide.addText(tier.subtitle, {
      x: x + 0.1, y: y + 0.48, w: 2.12, h: 0.28,
      fontSize: 9.5, bold: true, color: idx === 3 ? THEME.accent : THEME.accentGreen, fontFace: THEME.fontTitle, align: "center",
    });
    (tier.items || []).slice(0, 4).forEach((item, iIdx) => {
      const iy = y + 0.88 + iIdx * 0.92;
      slide.addShape("roundRect", {
        x: x + 0.12, y: iy, w: 2.08, h: 0.78, rectRadius: 0.06,
        fill: { color: THEME.cardInner }, line: { color: THEME.cardBorderSubtle, width: 1 },
      });
      slide.addText(item, {
        x: x + 0.16, y: iy + 0.14, w: 2.0, h: 0.5,
        fontSize: 9.5, color: THEME.textMuted, fontFace: THEME.fontBody, align: "center", wrap: true,
      });
    });
  });
}

// ==========================================
// Slides 7–11: Priority Use Cases (1–5)
// ==========================================
function addUseCaseDeepDiveSlide(slide, palette, { companyName, domain, pitchPlan, useCase, index, page }) {
  applyMaster(slide, palette, { companyName, domain, page });
  
  const uc = useCase || {};
  const ucNum = index + 1;
  const kicker = `PRIORITY USE CASE ${ucNum} OF 5 · STRATEGIC CAPABILITY`;
  const title = uc.title || `Operational Capability ${ucNum}`;
  const subtitle = uc.subtitle || uc.tagline || "Real-time stream intelligence & automated frontline decision action.";

  addSectionHeader(slide, palette, { kicker, title, subtitle });

  const colW = 5.98;
  const leftX = MARGIN; // 0.5
  const rightX = MARGIN + colW + 0.37; // 6.85
  const startY = 1.65;

  // ==========================================
  // LEFT COLUMN: OPERATIONAL PROBLEM & SOLUTION ARCHITECTURE
  // ==========================================
  
  // Left Container Top: The Business Challenge (Height 2.32)
  slide.addShape("roundRect", {
    x: leftX, y: startY, w: colW, h: 2.32, rectRadius: 0.08,
    fill: { color: THEME.card }, line: { color: THEME.cardBorder, width: 1 },
  });
  
  slide.addText("CURRENT OPERATIONAL CHALLENGE", {
    x: leftX + 0.25, y: startY + 0.18, w: colW - 0.5, h: 0.26,
    fontSize: 10.5, bold: true, color: THEME.accentOrange, fontFace: THEME.fontTitle,
  });
  
  const problemText = uc.challenge || uc.businessProblem || "Operational latency and disconnected telemetry across legacy systems cause manual bottlenecks, emergency delays, and uncoordinated escalations.";
  slide.addText(truncate(problemText, 320), {
    x: leftX + 0.25, y: startY + 0.48, w: colW - 0.5, h: 1.65,
    fontSize: 10.5, color: THEME.textMuted, fontFace: THEME.fontBody, wrap: true,
  });

  // Left Container Bottom: The Data & AI Solution Workflow (Height 2.65, y = startY + 2.47)
  const solY = startY + 2.47;
  slide.addShape("roundRect", {
    x: leftX, y: solY, w: colW, h: 2.65, rectRadius: 0.08,
    fill: { color: THEME.card }, line: { color: THEME.cardBorder, width: 1 },
  });

  slide.addText("THE AI & DATA SOLUTION ARCHITECTURE", {
    x: leftX + 0.25, y: solY + 0.18, w: colW - 0.5, h: 0.26,
    fontSize: 10.5, bold: true, color: THEME.accentGreen, fontFace: THEME.fontTitle,
  });

  const solutionSummary = uc.solutionFit || uc.benefit || uc.insight || "Ingests real-time system event streams into predictive ML models to orchestrate automated frontline triage and decision support.";
  slide.addText(truncate(solutionSummary, 180), {
    x: leftX + 0.25, y: solY + 0.46, w: colW - 0.5, h: 0.65,
    fontSize: 10.5, bold: true, color: THEME.textPrimary, fontFace: THEME.fontTitle, wrap: true,
  });

  // 3 Execution Steps inside solution
  const workflowSteps = (Array.isArray(uc.solutionMoves) && uc.solutionMoves.length >= 2)
    ? uc.solutionMoves.slice(0, 3)
    : [
        { lead: "Live Stream Ingestion", detail: "Captures and correlates live system telemetry without batch latency." },
        { lead: "Intelligent ML Scoring", detail: "Continuously evaluates capacity, risk, and anomaly patterns." },
        { lead: "Frontline Orchestration", detail: "Dispatches prioritized 1-click queues and automated alerts to staff." }
      ];

  workflowSteps.forEach((step, sIdx) => {
    const stepY = solY + 1.18 + sIdx * 0.45;
    slide.addShape("roundRect", {
      x: leftX + 0.22, y: stepY, w: 0.28, h: 0.28, rectRadius: 0.04,
      fill: { color: THEME.cardInner }, line: { color: THEME.accentGreen, width: 1 },
    });
    slide.addText(`${sIdx + 1}`, {
      x: leftX + 0.22, y: stepY + 0.02, w: 0.28, h: 0.24,
      fontSize: 8.5, bold: true, color: THEME.accentGreen, fontFace: THEME.fontTitle, align: "center",
    });
    const stepText = typeof step === "string" ? step : `${step.lead || "Execution Move"}: ${step.detail || ""}`;
    slide.addText(truncate(stepText, 100), {
      x: leftX + 0.58, y: stepY + 0.02, w: colW - 0.85, h: 0.38,
      fontSize: 9.5, color: THEME.textMuted, fontFace: THEME.fontBody, wrap: true,
    });
  });

  // ==========================================
  // RIGHT COLUMN: STRATEGIC BUSINESS VALUE & INTEGRATION
  // ==========================================

  // Right Container Top: Strategic Business Value Outcomes (Height 3.32)
  slide.addShape("roundRect", {
    x: rightX, y: startY, w: colW, h: 3.32, rectRadius: 0.08,
    fill: { color: THEME.card }, line: { color: THEME.cardBorder, width: 1 },
  });

  slide.addText("STRATEGIC BUSINESS VALUE & IMPACT", {
    x: rightX + 0.25, y: startY + 0.18, w: colW - 0.5, h: 0.26,
    fontSize: 10.5, bold: true, color: THEME.accent, fontFace: THEME.fontTitle,
  });

  // 3 Professional Business Value Cards
  const valCards = [
    {
      label: "OPERATIONAL THROUGHPUT & EFFICIENCY",
      color: THEME.accent,
      text: Array.isArray(uc.businessValue) && uc.businessValue[0]
        ? uc.businessValue[0]
        : "Eliminates operational blind spots, accelerates turnaround cycle times, and maximizes resource utilization across departments."
    },
    {
      label: "FINANCIAL IMPACT & RISK MITIGATION",
      color: THEME.accentGreen,
      text: Array.isArray(uc.businessValue) && uc.businessValue[1]
        ? uc.businessValue[1]
        : "Prevents revenue leakage, reduces false escalations, and ensures strict regulatory compliance across all live transactions."
    },
    {
      label: "FRONTLINE EMPOWERMENT & DECISION SPEED",
      color: THEME.accentAmber,
      text: Array.isArray(uc.businessValue) && uc.businessValue[2]
        ? uc.businessValue[2]
        : "Equips coordinators and domain specialists with prioritized 1-click work queues and proactive exception warnings."
    }
  ];

  valCards.forEach((vc, vIdx) => {
    const vy = startY + 0.50 + vIdx * 0.90;
    slide.addShape("roundRect", {
      x: rightX + 0.22, y: vy, w: colW - 0.44, h: 0.80, rectRadius: 0.06,
      fill: { color: THEME.cardInner }, line: { color: THEME.cardBorderSubtle, width: 1 },
    });
    slide.addText(vc.label, {
      x: rightX + 0.35, y: vy + 0.08, w: colW - 0.7, h: 0.20,
      fontSize: 9, bold: true, color: vc.color, fontFace: THEME.fontTitle,
    });
    slide.addText(truncate(vc.text, 140), {
      x: rightX + 0.35, y: vy + 0.30, w: colW - 0.7, h: 0.45,
      fontSize: 9.5, color: THEME.textPrimary, fontFace: THEME.fontBody, wrap: true,
    });
  });

  // Right Container Bottom: 2 Integration Sub-Boxes (Height 1.65, y = startY + 3.47)
  const intY = startY + 3.47;
  const subW = (colW - 0.20) / 2; // 2.89

  // Sub-Box 1: Data Sources
  slide.addShape("roundRect", {
    x: rightX, y: intY, w: subW, h: 1.65, rectRadius: 0.06,
    fill: { color: THEME.card }, line: { color: THEME.cardBorder, width: 1 },
  });
  slide.addText("DATA SOURCES & TELEMETRY", {
    x: rightX + 0.18, y: intY + 0.14, w: subW - 0.36, h: 0.22,
    fontSize: 9, bold: true, color: THEME.accent, fontFace: THEME.fontTitle,
  });
  const sourcesText = Array.isArray(uc.worksWith) && uc.worksWith.length ? uc.worksWith.join(" • ") : "Core enterprise records • Real-time event streams • Operational telemetry";
  slide.addText(truncate(sourcesText, 120), {
    x: rightX + 0.18, y: intY + 0.40, w: subW - 0.36, h: 1.10,
    fontSize: 9.5, color: THEME.textMuted, fontFace: THEME.fontBody, wrap: true,
  });

  // Sub-Box 2: Platform Capabilities
  const sub2X = rightX + subW + 0.20;
  slide.addShape("roundRect", {
    x: sub2X, y: intY, w: subW, h: 1.65, rectRadius: 0.06,
    fill: { color: THEME.card }, line: { color: THEME.cardBorder, width: 1 },
  });
  slide.addText("AI & PLATFORM CAPABILITIES", {
    x: sub2X + 0.18, y: intY + 0.14, w: subW - 0.36, h: 0.22,
    fontSize: 9, bold: true, color: THEME.accentGreen, fontFace: THEME.fontTitle,
  });
  const techText = Array.isArray(uc.techComponents) && uc.techComponents.length ? uc.techComponents.join(" • ") : "Real-Time Event Streaming • Delta Lakehouse • Predictive ML • Action Triggers";
  slide.addText(truncate(techText, 120), {
    x: sub2X + 0.18, y: intY + 0.40, w: subW - 0.36, h: 1.10,
    fontSize: 9.5, color: THEME.textMuted, fontFace: THEME.fontBody, wrap: true,
  });
}

// ==========================================
// Slide 12: Technical Feasibility Matrix
// ==========================================
function addDataReadinessSlide(slide, palette, { companyName, domain, pitchPlan, page }) {
  applyMaster(slide, palette, { companyName, domain, page });
  const rm = pitchPlan.readiness_meta || {};
  addSectionHeader(slide, palette, {
    kicker: rm.kicker || "TECHNICAL FEASIBILITY",
    title: rm.title || "Feasible on Existing Systems — No Rip-and-Replace",
    subtitle: rm.subtitle || `Each use case connects to ${pptSafe(companyName)}'s current systems through standard connectors and layers real-time AI on top.`,
  });

  const headers = ["Use Case", "Data Readiness", "Technical Complexity", "Time to Value", "Feasibility Note"];
  const colW = [3.2, 1.8, 1.8, 1.6, 3.53];
  
  const tableY = 1.65;
  slide.addShape("roundRect", {
    x: MARGIN, y: tableY, w: 12.33, h: 4.8, rectRadius: 0.08,
    fill: { color: THEME.card }, line: { color: THEME.cardBorder, width: 1 },
  });

  // Table Headers
  let cx = MARGIN + 0.2;
  headers.forEach((h, i) => {
    slide.addText(h, {
      x: cx, y: tableY + 0.2, w: colW[i], h: 0.28,
      fontSize: 10.5, bold: true, color: THEME.textDim, fontFace: THEME.fontTitle,
    });
    cx += colW[i];
  });

  const rows = (pitchPlan.feasibility_matrix || pitchPlan.use_cases || []).slice(0, 5);
  rows.forEach((r, idx) => {
    const ry = tableY + 0.58 + idx * 0.8;
    slide.addShape("roundRect", {
      x: MARGIN + 0.15, y: ry, w: 12.03, h: 0.72, rectRadius: 0.04,
      fill: { color: THEME.cardInner }, line: { color: THEME.cardBorderSubtle, width: 1 },
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
        fontSize: cIdx === 0 ? 11 : 9.5,
        bold: cIdx === 0 || cIdx === 1 || cIdx === 2,
        color: cIdx === 0 ? THEME.textPrimary : cIdx === 1 ? THEME.accentGreen : cIdx === 2 ? THEME.accentAmber : THEME.textMuted,
        fontFace: THEME.fontBody,
        wrap: true,
      });
      cx += colW[cIdx];
    });
  });
}

// ==========================================
// Slide 13: Implementation Roadmap
// ==========================================
function addRoadmapSlide(slide, palette, { companyName, domain, pitchPlan, page }) {
  applyMaster(slide, palette, { companyName, domain, page });
  const rdm = pitchPlan.roadmap_meta || {};
  addSectionHeader(slide, palette, {
    kicker: rdm.kicker || "IMPLEMENTATION ROADMAP",
    title: rdm.title || "A Phased Path from Pilot to Enterprise Scale",
    subtitle: rdm.subtitle || `A structured milestone plan delivering live operational value across ${pptSafe(companyName)} within 8 weeks.`,
  });

  const phases = (pitchPlan.roadmap_phases && pitchPlan.roadmap_phases.length >= 4)
    ? pitchPlan.roadmap_phases.slice(0, 4)
    : [
        { title: "Foundation", time: "Weeks 1–8", items: ["Stand up secure enterprise cloud lakehouse", "Connect core transactional & telemetry feeds", "Configure governance & security policies", "Validate ingestion latency (<500ms)"] },
        { title: "Pilot", time: "Weeks 8–16", items: ["Launch 2 priority high-value use cases", "Validate with flagship operational units", "Measure baseline KPI lift vs historical", "Refine user alerts and dashboards"] },
        { title: "Scale", time: "Months 4–9", items: ["Roll out remaining use cases across enterprise", "Extend to all departments and channels", "Introduce Copilot for frontline operators", "Conduct user training & adoption"] },
        { title: "Optimize", time: "Months 9+", items: ["Continuous ML model retraining & fine-tuning", "Cross-facility performance benchmarking", "Expand predictive autonomous actions", "Ongoing architecture optimization"] },
      ];

  phases.forEach((ph, idx) => {
    const x = MARGIN + idx * 3.16;
    const y = 1.65;
    slide.addShape("roundRect", {
      x, y, w: 2.94, h: 4.8, rectRadius: 0.08,
      fill: { color: THEME.card },
      line: { color: idx === 0 ? THEME.accent : THEME.cardBorder, width: idx === 0 ? 1.5 : 1 },
    });
    slide.addText(ph.title, {
      x: x + 0.18, y: y + 0.2, w: 2.58, h: 0.42,
      fontSize: 15, bold: true, color: THEME.textPrimary, fontFace: THEME.fontTitle, wrap: true,
    });
    slide.addText(ph.time, {
      x: x + 0.18, y: y + 0.65, w: 2.58, h: 0.28,
      fontSize: 12, bold: true, color: THEME.accent, fontFace: THEME.fontTitle,
    });
    (ph.items || []).slice(0, 4).forEach((item, iIdx) => {
      const iy = y + 1.1 + iIdx * 0.88;
      slide.addShape("roundRect", {
        x: x + 0.18, y: iy, w: 2.58, h: 0.78, rectRadius: 0.06,
        fill: { color: THEME.cardInner }, line: { color: THEME.cardBorderSubtle, width: 1 },
      });
      slide.addText(`• ${item}`, {
        x: x + 0.24, y: iy + 0.1, w: 2.44, h: 0.58,
        fontSize: 9.5, color: THEME.textMuted, fontFace: THEME.fontBody, wrap: true,
      });
    });
  });
}

// ==========================================
// Slide 14: Expected Impact & Next Steps
// ==========================================
function addNextStepsSlide(slide, palette, { companyName, domain, pitchPlan, page }) {
  applyMaster(slide, palette, { companyName, domain, page });
  const nsm = pitchPlan.next_steps_meta || {};
  addSectionHeader(slide, palette, {
    kicker: nsm.kicker || "EXPECTED IMPACT & NEXT STEPS",
    title: nsm.title || `From Pilot to Measurable Enterprise Value for ${pptSafe(companyName)}`,
    subtitle: nsm.subtitle || `A collaborative 3-step engagement plan to validate data readiness and launch the live operational pilot.`,
  });

  // Top 4 Stat Cards
  const kpis = (pitchPlan.overall_impact_kpis || pitchPlan.solution_kpis || []).slice(0, 4);
  kpis.forEach((k, idx) => {
    const x = MARGIN + idx * 3.16;
    const y = 1.65;
    slide.addShape("roundRect", {
      x, y, w: 2.94, h: 1.85, rectRadius: 0.08,
      fill: { color: THEME.card }, line: { color: idx === 0 ? THEME.accent : THEME.cardBorder, width: 1 },
    });
    slide.addText(k.value || k.benchmark || "+20–30%", {
      x: x + 0.18, y: y + 0.15, w: 2.58, h: 0.48,
      fontSize: 24, bold: true, color: idx === 0 ? THEME.accent : THEME.accentGreen, fontFace: THEME.fontTitle,
    });
    slide.addText(k.name || k.label || "Operational KPI", {
      x: x + 0.18, y: y + 0.68, w: 2.58, h: 0.95,
      fontSize: 11, bold: true, color: THEME.textPrimary, fontFace: THEME.fontTitle, wrap: true,
    });
  });

  // Bottom Next Steps Card
  const boxY = 3.68;
  slide.addShape("roundRect", {
    x: MARGIN, y: boxY, w: 12.33, h: 2.62, rectRadius: 0.08,
    fill: { color: THEME.card }, line: { color: THEME.cardBorder, width: 1 },
  });
  slide.addText("NEXT STEPS", {
    x: MARGIN + 0.25, y: boxY + 0.18, w: 11.83, h: 0.25,
    fontSize: 11, bold: true, color: THEME.accent, fontFace: THEME.fontTitle,
  });

  const steps = (pitchPlan.next_steps && pitchPlan.next_steps.length >= 3)
    ? pitchPlan.next_steps.slice(0, 3)
    : [
        { num: "01", title: "Pilot Scope Alignment", desc: `Confirm 2–3 priority pilot operational units and focus use cases with leadership team.` },
        { num: "02", title: "4-Week Discovery Assessment", desc: `Run discovery and data-readiness assessment across source systems, APIs, and security requirements.` },
        { num: "03", title: "Architecture Setup & Pilot Launch", desc: `Stand up the data & AI environment and launch the initial live operational dashboard within 8 weeks.` },
      ];

  steps.forEach((st, idx) => {
    const sy = boxY + 0.48 + idx * 0.68;
    slide.addShape("roundRect", {
      x: MARGIN + 0.2, y: sy, w: 11.93, h: 0.58, rectRadius: 0.04,
      fill: { color: THEME.cardInner }, line: { color: THEME.cardBorderSubtle, width: 1 },
    });
    slide.addText(st.num || `0${idx + 1}`, {
      x: MARGIN + 0.35, y: sy + 0.1, w: 0.5, h: 0.35,
      fontSize: 14, bold: true, color: THEME.accent, fontFace: THEME.fontTitle,
    });
    slide.addText(st.title ? `${st.title} — ${st.desc}` : st.desc, {
      x: MARGIN + 0.95, y: sy + 0.1, w: 11.0, h: 0.4,
      fontSize: 10.5, color: THEME.textMuted, fontFace: THEME.fontBody, wrap: true,
    });
  });
}

// Main builder function
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
  pres.title = `${pptSafe(companyName)} — ${pptSafe(plan.primary_business_domain || domain)}`;
  pres.subject = pptSafe(`${companyName} — ${requirement}`);

  let page = 1;

  // Slide 1: Cover Slide
  {
    const slide = pres.addSlide();
    addTitleSlide(slide, palette, { companyName, domain, pitchPlan: plan, platformName, requirement, page });
    page += 1;
  }

  // Slide 2: Agenda
  {
    const slide = pres.addSlide();
    addAgendaSlide(slide, palette, { companyName, domain, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 3: The Challenge
  {
    const slide = pres.addSlide();
    addChallengesSlide(slide, palette, { companyName, domain, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 4: The Solution
  {
    const slide = pres.addSlide();
    addSolutionVisionSlide(slide, palette, { companyName, domain, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 5: Data Landscape
  {
    const slide = pres.addSlide();
    addDataFoundationSlide(slide, palette, { companyName, domain, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 6: Technical Architecture
  {
    const slide = pres.addSlide();
    addArchitectureSlide(slide, palette, { companyName, domain, pitchPlan: plan, page });
    page += 1;
  }

  // Slides 7–11: 5 Dedicated Use Case Deep-Dive Slides
  const useCasesList = (plan.use_cases && plan.use_cases.length >= 1)
    ? plan.use_cases.slice(0, 5)
    : (useCases && Array.isArray(useCases.useCases) ? useCases.useCases.slice(0, 5) : []);

  useCasesList.forEach((uc, idx) => {
    const slide = pres.addSlide();
    addUseCaseDeepDiveSlide(slide, palette, { companyName, domain, pitchPlan: plan, useCase: uc, index: idx, page });
    page += 1;
  });

  // Slide 12: Technical Feasibility Matrix
  {
    const slide = pres.addSlide();
    addDataReadinessSlide(slide, palette, { companyName, domain, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 13: Implementation Roadmap
  {
    const slide = pres.addSlide();
    addRoadmapSlide(slide, palette, { companyName, domain, pitchPlan: plan, page });
    page += 1;
  }

  // Slide 14: Expected Impact & Next Steps
  {
    const slide = pres.addSlide();
    addNextStepsSlide(slide, palette, { companyName, domain, pitchPlan: plan, page });
    page += 1;
  }

  await pres.writeFile({ fileName: finalPath });
  return finalPath;
}
