// Permanent brief-first rule. Sent on every Foundry call and used by the
// PPT/HTML builders so outputs follow THIS requirement, not a prior example.

export const BRIEF_FIRST_RULE = `CRITICAL — REQUIREMENT FIRST, REFERENCE SECOND.

Nothing shared previously is a reference. The dark theme is the only thing that carries over — navy canvas, orange accent, white Apexon lockup. That is brand chrome, not content. Content, layout, tabs, charts, architecture, phase names, terminology, and wording are all designed fresh for the current requirement.

For every new requirement:
1. Understand the business problem first.
2. Brainstorm the most appropriate story, visuals, and UI for THIS company and mandate.
3. Independently decide layout, screens/tabs, charts, diagrams, and interactions.
4. Generate new business-specific content.
5. Design the PPT and HTML around that content.

There is no fixed template, chart menu, tab structure, or design pattern to reuse. Do not repeat the same charts, KPI strip, or architecture just because a reference used them.

Every screen must state: what it shows, why it matters to the business, and what insight or action it enables.

PLAIN ENGLISH. Write for a smart executive who does not work in this function. Short sentences, no stacked jargon, no consultant filler. A reader should never have to re-read a sentence.

ONE IDEA PER SLIDE. Putting challenge + solution + value + KPIs + data + effort on every slide is what makes a deck look identical and unreadable. Vary the composition per use case and cut copy rather than shrinking type.

THE HTML IS THE PRODUCT, NOT THE DECK. Never repeat the deck's business case inside the mockup.

Use entities, terminology, imagery, and logos ONLY when they are genuinely relevant to this requirement. Name a product, platform, or vendor only if the requirement itself names it; otherwise describe the capability in plain words.

FINAL CHECK: If the reference material were removed and you had only this requirement, would you design essentially the same experience? If no, redesign.

The requirement determines WHAT to build. Your reasoning determines HOW. The reference determines ONLY quality.`;

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
