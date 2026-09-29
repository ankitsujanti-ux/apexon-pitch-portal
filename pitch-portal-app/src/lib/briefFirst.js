// Permanent brief-first rule. Sent on every Foundry call and used by the
// PPT/HTML builders so outputs follow THIS requirement, not a prior example.

import { toLabel } from "./text.js";

export const BRIEF_FIRST_RULE = `CRITICAL — ZERO STATIC EXAMPLES: DYNAMIC SECTOR-DRIVEN & USE-CASE FIRST ARCHITECTURE.

You are an Apexon Senior Enterprise Solution Strategist, Industry Research Director, and Principal Pre-Sales Architect.
DO NOT use pre-baked examples, static templates, or borrowed references. For every deck and presentation, you must FIRST deeply analyze the client's specific SECTOR and the exact USE CASE / MANDATE, and plan the entire structure, architecture, and narrative directly from that sector's operational reality.

MANDATORY SECTOR & USE-CASE THINKING PRINCIPLES:
1. FIRST-PRINCIPLES SECTOR REASONING (No Static Examples):
   - Analyze the target Industry / Sector first (e.g., Healthcare, Banking/FinTech, Retail/CPG, Manufacturing, Energy/Utilities, Telecom, Supply Chain & Logistics, Life Sciences, Public Sector).
   - Dynamically identify the native operational environment where the work physically/digitally happens (e.g., Healthcare: ED triage bays, surgical suites, ICU, inpatient wards; Banking: payment switches, fraud screening desks, trading desks; Retail: store aisles, fulfillment centers, POS registers; Manufacturing: assembly lines, cleanrooms, PLC controllers).
   - Use the native operational terminology, data feeds, and core systems of that exact sector:
     * Healthcare: EHR/HIS (Epic, Cerner), ADT Feeds, HL7/FHIR streams, LIS/RIS, PACS, Nurse Call Systems, Bed Telemetry, ED Boarding, LOS, Bed Turnover Latency, Surgical Block Utilization, HIPAA/NABH compliance.
     * Banking & FinTech: Core Banking (Finacle, Temenos), ISO 8583/20022 message switches, UPI/Card rails, AML/KYC screening, Mule account detection, Sub-second Fraud Catch Rate, False Positive Ratio, PCI-DSS/RBI.
     * Retail & CPG: POS systems, OMS, WMS, Store Shelf Scans, Markdown Leakage, Stockout Rate, OTIF, Order-to-Delivery cycle times.
     * Manufacturing: MES, SCADA, PLC Historians, OEE, Scrap/Rework Rate, First-Pass Yield (FPY), Unplanned Downtime, MTBF, GMP/FDA.
     * Telecom, Energy, Logistics & Other Sectors: Mirror their exact operational systems, telemetry, and business metrics.
   - Strictly prohibit cross-domain contamination (e.g., never mention clinical metrics in banking, nor financial risk in hospital patient flow).

2. USE-CASE DRIVEN ARCHITECTURAL & CONTENT PLANNING:
   - For the specific Use Case / Mandate (e.g. Healthcare Bed Capacity Optimization, Real-Time Payment Fraud Interception, Predictive Store Replenishment, Smart Grid Outage Prevention), design the presentation from the ground up:
     * Who experiences the operational bottleneck (the exact frontline role).
     * What happens when the system is too slow or uncoordinated (the exact operational failure).
     * What decision leadership needs to take on Slide 1 vs Slide 14.
     * What data streams and automated actions resolve the challenge.

3. BOARDROOM-READY EXECUTIVE QUALITY & TONE:
   - Write in articulate, complete sentences suitable for CXOs and Executive VPs.
   - REJECT slogans, marketing fluff, or fragmented labels (e.g., enforce "Real-Time Bed & Capacity Management" over "Win the Bed Back"; enforce "Sub-Second Payment Fraud Interception" over "Fast Fraud Alert").

4. QUANTIFIED BUSINESS VALUE & ROI:
   - Tie every single proposal to measurable financial, operational, or risk metrics (e.g., +18–25% bed turnover velocity, <500ms fraud block latency, -35% stockout rate).

5. MODERN, VENDOR-NEUTRAL ENTERPRISE ARCHITECTURE:
   - Unless a vendor is explicitly demanded in the user prompt, use open modern lakehouse architecture: Real-Time Event Streaming, Unified Lakehouse (Delta Lake), Real-Time ML Inference, Operational Action Triggers, Executive Decision Workspace.`;

const STAGE_COLORS = ["1D6EE4", "0E7C66", "E54A24"];
const GUARD_COLORS = ["0E7C66", "1D6EE4", "6366F1", "E54A24"];

function clip(text, maxChars) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars).replace(/\s+\S*$/, "");
}

function reqText(requirement, domain) {
  return `${requirement || ""} ${domain || ""}`.toLowerCase();
}

// The platform NAME may only come from the brief. Its components are described
// as capabilities, never as sub-product names — naming a sub-product the brief
// never mentioned is exactly the borrowed-reference problem.
export function platformFromRequirement(requirement, domain = "") {
  const t = reqText(requirement, domain);
  const components = ["Bring the sources together", "Keep one set of definitions"];
  if (/real-?time|rti|live|event|stream|during the day/.test(t)) components.push("Act while it still matters");
  else components.push("Publish the operating view");
  if (/\bai\b|agent|copilot|brief|assist|model/.test(t)) components.push("Assisted decisions, with sign-off");
  else components.push("Trace every number to its source");

  const named = [
    [/genesys/, "Genesys Cloud"],
    [/fabric/, "Microsoft Fabric"],
    [/databricks/, "Databricks"],
    [/snowflake/, "Snowflake"],
    [/power bi/, "Power BI"],
    [/bigquery/, "BigQuery"],
    [/redshift/, "Redshift"],
    [/synapse/, "Azure Synapse"],
    [/azure/, "Microsoft Azure"],
    [/\baws\b|amazon web/, "AWS"],
    [/google cloud|\bgcp\b/, "Google Cloud"],
  ].find(([re]) => re.test(t));

  return { name: named ? named[1] : "Operating platform", components: components.slice(0, 4) };
}

// Only real product names belong here, and only when the brief named one.
// An empty list is the honest answer for a brief that named no platform.
export function defaultTechStack(requirement, domain = "") {
  const platform = platformFromRequirement(requirement, domain);
  return platform.name === "Operating platform" ? [] : [platform.name];
}

function domainSources(domain, requirement) {
  const t = reqText(requirement, domain);
  if (/food|beverage|chocolate|cocoa|confection|bakery|dairy/.test(t)) {
    return ["ERP", "MES / historian", "LIMS / quality", "WMS", "Supplier portal"];
  }
  if (/health|hospital|pharma|payer|provider|clinic|blue cross/.test(t)) {
    const health = ["EHR / EMR", "Claims (837/835)", "ADT Feeds", "CRM", "Care management"];
    if (/genesys/.test(t)) health[3] = "Genesys Cloud";
    return health;
  }
  if (/bank|payment|card|finance|lending/.test(t)) {
    return ["Core banking", "Card / Wire switch", "AML / KYC Risk", "CRM", "GL Warehouse"];
  }
  if (/retail|e-?comm|store|merchandise/.test(t)) {
    return ["POS", "eCommerce / OMS", "ERP", "WMS", "Loyalty / CRM"];
  }
  if (/insur/.test(t)) {
    return ["Policy admin", "Claims / FNOL", "Actuarial tables", "CRM", "Document store"];
  }
  if (/logist|supply|freight|warehouse/.test(t)) {
    return ["TMS", "WMS", "ELD / Telematics", "Yard / IoT", "Carrier EDI"];
  }
  if (/telecom|network/.test(t)) {
    return ["RAN Telemetry", "OSS / Alarms", "BSS / Billing", "CRM / Tickets", "Field dispatch"];
  }
  if (/energy|utilit|power|grid/.test(t)) {
    return ["SCADA / EMS", "AMI Smart meters", "GIS grid map", "CMMS asset logs", "Weather telemetry"];
  }
  return ["ERP", "Ops systems", "Files / APIs", "Quality / ops", "Reporting marts"];
}

function uniqueNames(list) {
  const seen = new Set();
  const out = [];
  const junk = /^(assumed source|assumed sources|source \d+|tbd|n\/?a|system|unknown|placeholder)$/i;
  for (const raw of list) {
    const name = clip(raw, 28);
    if (!name || junk.test(name)) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

function wantsGovernance(requirement) {
  const t = String(requirement || "").toLowerCase();
  return /govern|audit|compliant|lineage|regulat/.test(t);
}

export function inferArchitecture({
  companyName,
  domain,
  requirement,
  researchStructured,
  useCases = [],
}) {
  const fromResearch = (researchStructured?.systems || []).map((s) => s.name).filter(Boolean);
  const sources = uniqueNames([...fromResearch, ...domainSources(domain, requirement)]).slice(0, 8);
  const platform = platformFromRequirement(requirement, domain);
  // Titles often carry a "— Company" suffix; repeating it on every bullet of
  // the architecture slide is noise.
  const jobs = (useCases || [])
    .map((uc) => String(uc.title || "").replace(/\s*[\u2014\u2013-]\s*[^\u2014\u2013-]*$/, "").trim() || uc.title)
    .filter(Boolean)
    .slice(0, 3);
  const req = reqText(requirement, domain);

  let stages;
  if (/real-?time|rti|live|operations|event|pulse/.test(req)) {
    stages = [
      { title: "1. Connect what they already run", steps: ["Source access", "Event and batch feeds", "Keep existing systems"] },
      { title: "2. Make it usable in time to act", steps: ["One operating picture", "Live exceptions", "Trusted metrics"] },
      { title: "3. Put a decision in front of people", steps: jobs.length ? jobs : ["Owner alert", "Leadership brief", "Record the action"] },
    ];
  } else if (/ai|agent|foundry|brief|copilot/.test(req)) {
    stages = [
      { title: "1. Trusted inputs only", steps: ["Approved sources", "Access control", "No shadow feeds"] },
      { title: "2. Governed generation", steps: ["Draft from trusted data", "Independent check", "Human sign-off"] },
      { title: "3. Action in the operation", steps: jobs.length ? jobs : ["Brief the owner", "Next step", "Audit trail"] },
    ];
  } else {
    stages = [
      { title: "1. Land the sources that matter", steps: ["Priority systems", "Access and quality", "What can wait"] },
      { title: "2. Unify for this mandate", steps: ["Shared definitions", "Operating views", "Exception path"] },
      { title: "3. Decisions this team can take", steps: jobs.length ? jobs : ["Daily briefing", "Exception queue", "Leadership view"] },
    ];
  }

  const guards = wantsGovernance(requirement)
    ? [
        { n: "01", title: "Trusted data", body: "Only approved sources reach the view." },
        { n: "02", title: "Human control", body: "People still take the operating decision." },
        { n: "03", title: "Traceable", body: "Every number can be walked back to a feed." },
      ]
    : [];

  return {
    title: "How this would work",
    subtitle: clip(
      `What ${companyName} would put in place to deliver this, and the systems it builds on.`,
      140
    ),
    sources: sources.map((name) => ({ name, role: "" })),
    stages,
    target: platform,
    guards,
  };
}

export function normalizeArchitecture(raw, ctx) {
  const inferred = inferArchitecture(ctx);
  if (!raw || typeof raw !== "object") return inferred;

  const sources = uniqueNames(
    (Array.isArray(raw.sources) ? raw.sources : []).map((s) => (typeof s === "string" ? s : s?.name))
  );
  const stages = (Array.isArray(raw.stages) ? raw.stages : [])
    .filter((st) => st?.title)
    .slice(0, 3)
    .map((st, i) => ({
      title: toLabel(st.title, 8),
      color: STAGE_COLORS[i],
      steps: (Array.isArray(st.steps) ? st.steps : []).map((step) => toLabel(step, 8)).filter(Boolean).slice(0, 6),
    }))
    .filter((st) => st.steps.length);

  const targetName = clip(raw.target?.name || inferred.target.name, 32);
  const components = (Array.isArray(raw.target?.components) ? raw.target.components : inferred.target.components)
    .map((c) => clip(c, 28))
    .filter(Boolean)
    .slice(0, 4);

  const guards = (Array.isArray(raw.guards) ? raw.guards : inferred.guards)
    .filter((g) => g?.title || g?.body)
    .slice(0, 4)
    .map((g, i) => ({
      n: clip(g.n || String(i + 1).padStart(2, "0"), 4),
      title: clip(g.title, 22),
      body: clip(g.body, 70),
      color: GUARD_COLORS[i],
    }));

  return {
    title: toLabel(raw.title || inferred.title, 8) || "How this would work",
    subtitle: clip(raw.subtitle || inferred.subtitle, 140),
    sources: (sources.length ? sources : inferred.sources.map((s) => s.name)).slice(0, 8).map((name) => ({ name })),
    stages: stages.length
      ? stages
      : inferred.stages.map((st, i) => ({ ...st, color: STAGE_COLORS[i] })),
    target: { name: targetName, components: components.length ? components : inferred.target.components },
    guards,
  };
}
