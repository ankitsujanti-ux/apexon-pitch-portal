// Permanent brief-first rule. Sent on every Foundry call and used by the
// PPT/HTML builders so outputs follow THIS requirement, not a prior example.

export const BRIEF_FIRST_RULE = `CORE RULE: Treat every shared document, slide, HTML file, or diagram as reference for quality only. Do not reuse its domain, product names, architecture, wording, layouts, or visuals unless the CURRENT requirement explicitly asks for them.

Required workflow:
1. Extract the current company, domain, requirement, and constraints.
2. Ignore unrelated details from reference material (Harness product PPT, Hornets demo, prior clients).
3. Internally brainstorm at least two viable approaches for THIS brief.
4. Choose the approach that best fits the requirement.
5. Generate all copy, architecture, diagrams, and UI labels from that choice.

Design: new information architecture per request. Name systems and screens in THEIR language. If the requirement changes, the output must change substantially.

Reuse check before you answer: primary subject is this brief; no leftover names, technologies, or patterns from a reference unless explicitly requested; architecture reflects the requested system.

If the brief is thin, mark assumptions as industry-typical. Do not fill gaps from a previous example.`;

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

export function platformFromRequirement(requirement, domain = "") {
  const t = reqText(requirement, domain);
  if (/fabric/.test(t)) {
    const components = ["OneLake", "Pipelines"];
    if (/real-?time|rti|intelligence|event/.test(t)) components.push("Real-Time Intelligence");
    else components.push("Power BI");
    if (/ai|foundry|agent/.test(t)) components.push("Azure AI");
    else components.push("Semantic models");
    return { name: "Microsoft Fabric", components: components.slice(0, 4) };
  }
  if (/databricks/.test(t)) {
    return { name: "Databricks", components: ["Lakehouse", "Workflows", "SQL", "AI"] };
  }
  if (/snowflake/.test(t)) {
    return { name: "Snowflake", components: ["Warehouse", "Piping", "Sharing", "Compute"] };
  }
  if (/power bi/.test(t)) {
    return { name: "Power BI", components: ["Semantic models", "Reports", "Refresh", "Governance"] };
  }
  if (/azure/.test(t)) {
    return { name: "Microsoft Azure", components: ["Data platform", "AI", "Security", "Ops views"] };
  }
  return { name: "Target platform", components: ["Ingest", "Store", "Decide", "Share"] };
}

export function defaultTechStack(requirement, domain = "") {
  const platform = platformFromRequirement(requirement, domain);
  return [platform.name, ...platform.components].slice(0, 3);
}

function domainSources(domain, requirement) {
  const t = reqText(requirement, domain);
  if (/food|beverage|chocolate|cocoa|confection|bakery|dairy/.test(t)) {
    return ["ERP", "MES / historian", "LIMS / quality", "WMS", "Supplier portal"];
  }
  if (/health|hospital|pharma|payer|provider|clinic/.test(t)) {
    return ["EHR / EMR", "Claims", "ERP", "Scheduling", "Quality registry"];
  }
  if (/bank|payment|card|finance|lending/.test(t)) {
    return ["Core system", "CRM", "Payments", "Risk / cases", "Warehouse"];
  }
  if (/retail|e-?comm|store|merchandise/.test(t)) {
    return ["POS", "eCommerce", "ERP", "WMS", "Loyalty / CRM"];
  }
  if (/insur/.test(t)) {
    return ["Policy admin", "Claims", "CRM", "Document store", "Warehouse"];
  }
  if (/logist|supply|freight|warehouse/.test(t)) {
    return ["TMS", "WMS", "ERP", "Yard / IoT", "Customer portal"];
  }
  return ["ERP", "Ops systems", "Files / APIs", "Quality / ops", "Reporting marts"];
}

function uniqueNames(list) {
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const name = clip(raw, 28);
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

function wantsHarnessMigrator(requirement) {
  const t = String(requirement || "").toLowerCase();
  return /harness/.test(t) && /migrat|discover|database|moderniz/.test(t);
}

function wantsGovernance(requirement) {
  const t = String(requirement || "").toLowerCase();
  return /govern|harness|audit|purview|compliant|lineage/.test(t);
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
  const jobs = (useCases || []).map((uc) => uc.title).filter(Boolean).slice(0, 3);
  const req = reqText(requirement, domain);

  let stages;
  if (wantsHarnessMigrator(requirement)) {
    stages = [
      { title: "1. Discover and assess", steps: ["Connect sources", "Validate access", "Catalog metadata", "SME review"] },
      { title: "2. Plan and approve", steps: ["Use-case plan", "Architecture check", "Go / no-go"] },
      { title: "3. Generate deliverables", steps: ["Pipelines, models, and docs on the approved path"] },
    ];
  } else if (/real-?time|rti|live|operations|event|pulse/.test(req)) {
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
    ? wantsHarnessMigrator(requirement)
      ? [
          { n: "L1", title: "Constraint", body: "Trusted inputs only" },
          { n: "L2", title: "AI validation", body: "Check generated output" },
          { n: "L3", title: "Plan check", body: "Check the proposed path" },
          { n: "L4", title: "Quality gate", body: "Ready to run and audit" },
        ]
      : [
          { n: "01", title: "Trusted data", body: "Only approved sources reach the view." },
          { n: "02", title: "Human control", body: "People still take the operating decision." },
          { n: "03", title: "Traceable", body: "Every number can be walked back to a feed." },
        ]
    : [];

  return {
    title: "Proposed architecture",
    subtitle: clip(`${companyName}: path for this mandate. Sources are confirmed only when research said so.`, 140),
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
      title: clip(st.title, 42),
      color: STAGE_COLORS[i],
      steps: (Array.isArray(st.steps) ? st.steps : []).map((step) => clip(step, 42)).filter(Boolean).slice(0, 6),
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
    title: clip(raw.title || inferred.title, 42) || "Proposed architecture",
    subtitle: clip(raw.subtitle || inferred.subtitle, 140),
    sources: (sources.length ? sources : inferred.sources.map((s) => s.name)).slice(0, 8).map((name) => ({ name })),
    stages: stages.length
      ? stages
      : inferred.stages.map((st, i) => ({ ...st, color: STAGE_COLORS[i] })),
    target: { name: targetName, components: components.length ? components : inferred.target.components },
    guards,
  };
}
