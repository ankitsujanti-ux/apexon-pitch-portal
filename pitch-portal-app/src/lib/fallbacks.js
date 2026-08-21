// Local fallbacks used when Azure AI Foundry is unavailable.
// Content is still company- and domain-specific so the deck and HTML
// are not empty generic placeholders.

import { inferArchitecture, defaultTechStack } from "./briefFirst.js";

function sentence(text, fallback) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean || fallback;
}

function industryKey(domain, requirement) {
  const t = `${domain} ${requirement}`.toLowerCase();
  if (/food|beverage|chocolate|cocoa|confection|bakery|dairy|snack/.test(t)) return "food";
  if (/health|hospital|pharma|payer|provider|clinic/.test(t)) return "health";
  if (/bank|payment|card|finance|lending/.test(t)) return "finance";
  if (/retail|e-?comm|store|merchandise/.test(t)) return "retail";
  if (/insur/.test(t)) return "insurance";
  if (/logist|supply|freight|warehouse/.test(t)) return "logistics";
  if (/telecom|network/.test(t)) return "telecom";
  if (/energy|utilit|oil|gas/.test(t)) return "energy";
  return "manufacturing";
}

export function fallbackResearch({ companyName, domain, requirement }) {
  const key = industryKey(domain, requirement);
  const req = sentence(requirement, "a governed Azure data and AI platform");

  const packs = {
    food: `${companyName} is a ${domain} producer. Day-to-day work is recipes, batches, quality holds, ingredients, and shipping finished goods on time. Leaders care about yield, food safety, and whether today's run will meet tomorrow's orders.

Typical systems include ERP (orders and inventory), MES or a production historian (line events), LIMS or quality systems (lab results and holds), WMS (warehouse), and supplier portals. The useful data is already there: batch records, temperatures, quality checks, cocoa or ingredient inventory, and customer orders. It is rarely in one place in time to act.

The mandate here is "${req}". That means joining those sources and putting line and quality events in front of the plant while a run can still be corrected. Every food-safety control stays in place: FDA, HACCP, allergen labeling, and lot traceability.`,
    health: `${companyName} operates in ${domain}. Work centers on patients or members, encounters, claims, quality measures, and staffing. Delays in seeing exceptions (denials, census spikes, missed SLAs) show up as cost and risk.

Typical systems include EHR/EMR, claims platforms, ERP, scheduling, and quality registries. PHI and payer data already exist but sit behind access controls and batch reports.

The mandate here is "${req}". That means bringing those sources together and showing exceptions where the rules allow it. Only approved data is used, and every step leaves an audit trail under HIPAA, payer rules, and retention policy.`,
    finance: `${companyName} is a ${domain} business. Revenue depends on transactions, risk, customer servicing, and staying inside regulatory bounds. Overnight reports are too slow when fraud, liquidity, or service exceptions move during the day.

Typical systems include core banking or card processing, CRM, payment switches, data warehouses, and case-management tools. Transaction, customer, and risk data already exist.

The mandate here is "${req}". That means joining those feeds and surfacing exceptions during the day rather than overnight. Every decision stays inside existing controls: PCI, SOX, model risk, and access logging.`,
    retail: `${companyName} sells in ${domain}. The operating problem is matching demand, stock, and fulfillment while promotions and supply shift during the day.

Typical systems include POS, e-commerce, ERP, WMS, and loyalty/CRM. Sales, inventory, and fulfillment events already exist but land in separate reports.

The mandate here is "${req}". That means bringing sell-through and inventory together, then flagging stockouts and late deliveries while they can still be fixed. Merchants get a briefing built only from numbers that exist.`,
    manufacturing: `${companyName} is a ${domain} organization. Plants, suppliers, and planners need to see what is happening on the line and in the order book, not yesterday's snapshot.

Typical systems include ERP, MES, quality/QMS, WMS, and machine historians. Orders, inventory, OEE, and quality events already exist.

The mandate here is "${req}". That means joining those sources and turning line and order events into one operating picture. Every assisted decision stays inside governance: access control, lineage, and audit.`,
  };

  packs.insurance = packs.finance;
  packs.logistics = packs.retail;
  packs.telecom = packs.manufacturing;
  packs.energy = packs.manufacturing;

  return packs[key] || packs.manufacturing;
}

const PACKS = {
  food: [
    {
      title: (c) => `Live production pulse — ${c}`,
      problem: (c) => `${c} cannot see live line status, yield, and holds across batches, so issues surface after the run is already off-spec.`,
      fit: () => "Line, temperature, and batch events become a live operations board the plant can act on.",
      data: "MES/historian events, batch records, line temperatures",
      availability: "existing",
      difficulty: "easier",
      difficultyWhy: "Line and batch data typically already exist in MES or a historian for this industry. Treat as typical unless confirmed.",
      kpis: [
        { name: "Batches in band", why: "Share of runs staying inside the process window, which is the clearest read on whether the line is stable." },
        { name: "Time to first alert", why: "How quickly operations sees a drift, because every minute of delay is product already committed." },
        { name: "Holds opened live", why: "Exceptions caught during the run rather than after, which is where scrap and rework are avoided." },
        { name: "Feed health", why: "Whether the plant stream is still landing, since a stale board quietly stops being trusted." },
      ],
      demoScore: 10,
    },
    {
      title: (c) => `Quality hold radar — ${c}`,
      problem: (c) => `${c} finds quality or allergen exceptions only after product has moved, which creates scrap, rework, and recall risk.`,
      fit: () => "Streaming rules flag holds as they happen and route them to the quality owner.",
      data: "LIMS/quality checks, allergen and lot records",
      availability: "existing",
      demoScore: 9,
    },
    {
      title: (c) => `Ingredient and finished-goods signal — ${c}`,
      problem: (c) => `${c} plans ingredient and finished-goods inventory from yesterday's reports, which creates stockouts and waste.`,
      fit: () => "Orders, inventory, and supplier receipts sit in one view so planners see what is changing now.",
      data: "ERP inventory, purchase orders, warehouse receipts",
      availability: "existing",
      demoScore: 8,
    },
    {
      title: (c) => `Governed ops briefing — ${c}`,
      problem: (c) => `${c} leaders get long, conflicting plant reports instead of a short, trusted daily briefing.`,
      fit: () => "A governed briefing summarizes trusted operational data in plain language, with a source behind each number.",
      data: "KPI marts, quality summaries, production totals",
      availability: "existing",
      demoScore: 7,
    },
    {
      title: (c) => `Lot traceability trail — ${c}`,
      problem: (c) => `${c} struggles to prove lot lineage from ingredient to customer when quality or a retailer asks.`,
      fit: () => "Lot, recipe, and shipping lineage stay in one auditable trail when quality or a retailer asks.",
      data: "Lot genealogy, shipping, recipe/BOM",
      availability: "new",
      demoScore: 6,
    },
  ],
  manufacturing: [
    {
      title: (c) => `Live operations pulse — ${c}`,
      problem: (c, d) => `${c} cannot see live ${d} operations across sites, so issues surface too late.`,
      fit: () => "Event streams become a live operations board leaders can act on.",
      data: "Plant, order, and event telemetry",
      availability: "existing",
      demoScore: 10,
    },
    {
      title: (c) => `Exception radar — ${c}`,
      problem: (c) => `${c} finds quality, delay, or risk exceptions only after they have already cost time and money.`,
      fit: () => "Streaming rules and AI agents flag exceptions as they happen and route them to the right owner.",
      data: "Quality, SLA, and incident records",
      availability: "existing",
      demoScore: 9,
    },
    {
      title: (c) => `Demand and inventory signal — ${c}`,
      problem: (c, d) => `${c} plans ${d} inventory from yesterday's reports, which creates stockouts and waste.`,
      fit: () => "Sales, inventory, and supply signals sit in one view so planners see what is changing now.",
      data: "Orders, inventory, and supplier feeds",
      availability: "existing",
      demoScore: 8,
    },
    {
      title: (c) => `Governed AI briefing — ${c}`,
      problem: (c) => `${c} leaders get long, conflicting reports instead of a short, trusted daily briefing.`,
      fit: () => "A governed briefing summarizes trusted operational data in plain language, with a source behind each number.",
      data: "KPI marts and operational summaries",
      availability: "existing",
      demoScore: 7,
    },
    {
      title: (c, d) => `Traceability and audit trail — ${c}`,
      problem: (c, d) => `${c} struggles to prove ${d} lineage and control when auditors or customers ask.`,
      fit: () => "Lineage, access, and audit history stay in one trail when auditors or customers ask.",
      data: "Lineage, access logs, and master data",
      availability: "new",
      demoScore: 6,
    },
  ],
};

PACKS.health = PACKS.manufacturing;
PACKS.finance = PACKS.manufacturing;
PACKS.retail = PACKS.manufacturing;
PACKS.insurance = PACKS.manufacturing;
PACKS.logistics = PACKS.manufacturing;
PACKS.telecom = PACKS.manufacturing;
PACKS.energy = PACKS.manufacturing;

export function fallbackUseCases({ companyName, domain, requirement, numUseCases = 5, numMockupTabs = 5 }) {
  const shapes = PACKS[industryKey(domain, requirement)] || PACKS.manufacturing;
  const layouts = [
    ["alerts", "table"],
    ["record", "actions"],
    ["heat", "kpis"],
    ["compare", "timeline"],
    ["entities", "flow"],
  ];
  const useCases = shapes.slice(0, numUseCases).map((shape, i) => {
    const label = shape.title(companyName, domain).split(/[—–-]/)[0].trim();
    const problem = shape.problem(companyName, domain);
    const fit = shape.fit();
    return {
      title: shape.title(companyName, domain),
      subtitle: `Give ${companyName} this decision while it can still be changed`,
      businessProblem: problem,
      benefit: fit,
      solutionFit: `${fit} This maps to: ${sentence(requirement, "the stated mandate")}.`,
      challenge: `${problem} The data already exists across ${domain} systems, but it arrives as an overnight report rather than a signal someone can act on. By the time the pack is read, the window to change the outcome has usually closed.`,
      solutionMoves: [
        {
          lead: "See it live",
          detail: `${label} becomes a single operating view, so the team sees status as it changes instead of the next morning.`,
        },
        {
          lead: "Act instantly",
          detail: "When a threshold is crossed the exception is routed to a named owner with the context needed to decide.",
        },
        {
          lead: "Keep the audit",
          detail: "Every number keeps its source and every action is recorded, so the view stands up to review.",
        },
      ],
      worksWith: [
        `Reads the ${domain} systems ${companyName} already runs — nothing is ripped out or replaced.`,
        "Existing reporting keeps running while this view handles the in-the-moment decisions.",
        "Access and permissions stay with the systems that own the data today.",
      ],
      businessValue: [
        "Issues are caught inside the window where a decision still changes the outcome.",
        "Less time is spent reconciling conflicting reports before anyone can act.",
        "Leadership gets one version of the number, with the source behind it.",
      ],
      proofPoint: "",
      assumptions: [
        {
          claim: `${companyName} runs the ${domain} systems this use case reads from.`,
          confidence: "industry-typical",
          basis: "Normal for an operator of this size, but not confirmed for this company.",
        },
        {
          claim: "The data behind this view is already captured somewhere today.",
          confidence: "industry-typical",
          basis: "Assumed from industry norms — validate in discovery before committing.",
        },
      ],
      whatItShows: `${label} for ${companyName} — what is outside the expected range right now, and who owns it.`,
      whyItMatters: problem,
      action: fit,
      lookFirst: label,
      blocks: layouts[i] || ["table", "actions"],
      slideLayout: ["challenge", "impact", "shift", "journey", "evidence"][i % 5],
      entities: [companyName, domain, "Shift", "Owner"].slice(0, 4),
      steps: ["See the exception", "Assign an owner", "Act in the window", "Record the outcome"],
      kpis: shape.kpis || [
        { name: "Open exceptions", why: "How many items need a person right now, which tells leadership if the team is keeping up." },
        { name: "On-time signal", why: "Whether operations are staying inside the agreed window rather than drifting quietly." },
        { name: "Oldest open item", why: "How long the slowest issue has waited, which is where cost and risk build up." },
        { name: "Feed health", why: "Whether the underlying data is still landing, because a stale view is worse than no view." },
      ],
      dataPointer: {
        description: `${shape.data} — data a ${domain} operator of this size typically already captures today.`,
        availability: shape.availability,
        confidence: "industry-typical",
      },
      difficulty: shape.difficulty || (shape.availability === "new" ? "harder" : "moderate"),
      difficultyWhy:
        shape.difficultyWhy ||
        (shape.availability === "new"
          ? "Needs a new source or join that is not confirmed at this company, so scope it in discovery first."
          : "Uses data this industry usually already holds, so the work is mostly joining and surfacing it."),
      techComponents: defaultTechStack(requirement, domain),
      demoScore: shape.demoScore,
    };
  });

  return {
    useCases,
    topForMockup: useCases.slice(0, numMockupTabs).map((uc) => uc.title),
    overallBenefits: [
      `One operating picture for ${companyName} instead of overnight packs.`,
      "Exceptions reach the owner while there is still time to act.",
      "AI briefings stay on governed data, with a source behind every number.",
      "Leadership can walk a live demonstration, not a static slide.",
    ],
    deckKicker: companyName,
    deckTitle: `${companyName} operating picture`,
    deckSubtitle: sentence(requirement, `${domain} leadership walkthrough`),
    closeLine: `Walk the live demonstration with ${companyName} next.`,
    architecture: inferArchitecture({ companyName, domain, requirement, useCases }),
  };
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function dashboardCopy(companyName, domain, useCase) {
  const blob = `${useCase.title} ${useCase.businessProblem} ${domain}`.toLowerCase();
  const lot = companyName.slice(0, 3).toUpperCase();

  if (/allergen|label/.test(blob)) {
    return {
      kpis: [
        { value: "3", label: "Changeovers today", why: "Milk, dark, and specialty changeovers on the line today.\nEach one is a labeling and allergen risk window." },
        { value: "99.2%", label: "Label match", why: "Share of packs whose printed allergen statement matches the recipe.\nThis is the control that prevents a recall." },
        { value: "2", label: "Open label holds", why: "Lots waiting because a label or allergen check failed.\nThey should not move to shipping." },
        { value: "Healthy", label: "Recipe feed", why: "Health of the BOM and label data feed.\nGreen means the simulated stream is still updating." },
      ],
      trend: "Changeover risk (last 30 min)",
      breakdown: "Checks by result",
      bars: [
        { label: "Match 88%", w: 200, color: "#1D6EE4" },
        { label: "Watch 8%", w: 90, color: "#FFCA5E" },
        { label: "Hold 4%", w: 50, color: "#E54A24" },
      ],
      feed: [
        ["good", "OK Clear", `${companyName} dark-chocolate run labels verified against BOM.`],
        ["warn", "Watch", "Milk changeover on line 1 in 12 minutes — allergen kit staged."],
        ["bad", "Act Hold", `Label mismatch on ${lot}-104. Lot held before palletizing.`],
        ["good", "OK Clear", "Allergen statement feed refreshed from recipe system."],
      ],
      button: "Simulate a mislabel event",
      event: `Simulated allergen label mismatch for ${companyName} — lot held.`,
    };
  }

  if (/roast|conche|melt|viscosity|flavor/.test(blob)) {
    return {
      kpis: [
        { value: "4", label: "Off-spec signals", why: "Roast or viscosity readings outside the target band.\nCatching these now avoids scrap after molding." },
        { value: "97.4%", label: "In-band roast", why: "Share of the last hour inside the roast profile window.\nLeaders use this to see if the process is stable." },
        { value: "11m", label: "Oldest alert age", why: "How long the oldest off-spec signal has waited.\nLong waits mean product may already be committed." },
        { value: "Healthy", label: "Historian feed", why: "Health of the MES/historian stream.\nGreen means the simulated stream is still updating." },
      ],
      trend: "Viscosity drift (last 30 min)",
      breakdown: "Roast status mix",
      bars: [
        { label: "In band 76%", w: 190, color: "#1D6EE4" },
        { label: "Watch 16%", w: 100, color: "#FFCA5E" },
        { label: "Off spec 8%", w: 55, color: "#E54A24" },
      ],
      feed: [
        ["good", "OK Clear", `Roaster 2 back inside profile for ${companyName} couverture.`],
        ["warn", "Watch", "Conche 4 viscosity trending high — still inside spec."],
        ["bad", "Act", `Off-spec melt on batch ${lot}-220. Owner assigned.`],
        ["good", "OK Clear", "Historian roast curve refreshed."],
      ],
      button: "Simulate an off-spec roast",
      event: `Simulated roast-profile excursion for ${companyName} — batch flagged.`,
    };
  }

  if (/hold|quality|exception|defect/.test(blob)) {
    return {
      kpis: [
        { value: "7", label: "Open quality holds", why: "Lots waiting on a quality decision right now.\nDelayed release creates scrap and missed shipments." },
        { value: "98.1%", label: "Checks on spec", why: "Share of today's checks inside the spec window.\nLeaders use this to see if the line is staying in control." },
        { value: "14m", label: "Oldest hold age", why: "How long the oldest open hold has been waiting.\nLong waits mean product is sitting instead of shipping." },
        { value: "Healthy", label: "Quality feed", why: "Health of the quality and lab data feed.\nGreen means the simulated stream is still updating." },
      ],
      trend: "Hold volume (last 30 min)",
      breakdown: "Holds by status",
      bars: [
        { label: "Released 62%", w: 200, color: "#1D6EE4" },
        { label: "Watch 23%", w: 110, color: "#FFCA5E" },
        { label: "Hold 15%", w: 70, color: "#E54A24" },
      ],
      feed: [
        ["good", "OK Clear", `Lot ${lot}-441 released after lab sign-off.`],
        ["warn", "Watch", "Moisture check on line 2 trending high — still inside spec."],
        ["bad", "Act Hold", `Quality hold on ${companyName} batch 104. Disposition needed.`],
        ["good", "OK Clear", "LIMS feed refreshed; no new critical holds."],
      ],
      button: "Simulate a quality hold",
      event: `Simulated quality hold raised for ${companyName} — owner assigned.`,
    };
  }

  if (/brief|governed|next.?best/.test(blob)) {
    return {
      kpis: [
        { value: "5", label: "Sources cited", why: "How many trusted sources sit behind this briefing.\nEvery number should point back to one of them." },
        { value: "2", label: "Items needing a call", why: "Recommendations that still need a person to decide.\nThe agent does not act on its own." },
        { value: "12m", label: "Brief freshness", why: "How recently the briefing was rebuilt from governed data.\nStale briefs should not be used in a walkthrough." },
        { value: "Governed", label: "Agent status", why: "The agent is limited to approved tables.\nIt will not invent figures from the open web." },
      ],
      trend: "Brief refresh cadence",
      breakdown: "Recommendation mix",
      bars: [
        { label: "Inform 58%", w: 180, color: "#1D6EE4" },
        { label: "Review 29%", w: 110, color: "#FFCA5E" },
        { label: "Escalate 13%", w: 70, color: "#E54A24" },
      ],
      feed: [
        ["good", "Inform", `${companyName} overnight totals match the operating KPI mart.`],
        ["warn", "Review", "Two quality holds are still open — include in the stand-up."],
        ["bad", "Escalate", `Line 3 yield dropped versus plan. Owner needs a call.`],
        ["good", "Inform", "Briefing rebuilt from governed operational tables."],
      ],
      button: "Refresh the briefing",
      event: `Simulated briefing refresh for ${companyName} — two items flagged for review.`,
    };
  }

  if (/trace|lineage|audit/.test(blob)) {
    return {
      kpis: [
        { value: "4", label: "Lots in trail", why: "Lots currently in the genealogy path being walked.\nThis is the chain from ingredient to shipment." },
        { value: "100%", label: "Steps documented", why: "Share of hops with a source system behind them.\nGaps are the recall risk." },
        { value: "2.4m", label: "Last hop age", why: "How recently the latest movement posted.\nOld hops mean the trail is not live." },
        { value: "Healthy", label: "Genealogy feed", why: "Health of lot, recipe, and shipping feeds.\nGreen means the simulated trail is still updating." },
      ],
      trend: "Trail completeness",
      breakdown: "Hops by confidence",
      bars: [
        { label: "Confirmed 81%", w: 200, color: "#1D6EE4" },
        { label: "Typical 14%", w: 90, color: "#FFCA5E" },
        { label: "Gap 5%", w: 50, color: "#E54A24" },
      ],
      feed: [
        ["good", "OK Clear", `Lot ${lot}-104 ingredient receipt posted from ERP.`],
        ["warn", "Watch", "Recipe version missing a signed change — still within control."],
        ["bad", "Act Gap", `${companyName} shipment ${lot}-882 has an unlinked pallet hop.`],
        ["good", "OK Clear", "Purview lineage snapshot refreshed."],
      ],
      button: "Simulate a lineage gap",
      event: `Simulated lineage gap for ${companyName} — hop needs a source.`,
    };
  }

  if (/inventory|demand|ingredient|stock/.test(blob)) {
    return {
      kpis: [
        { value: "12", label: "Items below min", why: "SKUs or ingredients under the safety stock line.\nThese are the ones most likely to stop a production run." },
        { value: "96%", label: "Fill vs orders", why: "Share of today's orders that can be filled from current stock.\nBelow target means sales and planning need to talk." },
        { value: "3.2d", label: "Cover remaining", why: "Days of cover on the tightest ingredient.\nThis is illustrative, not a live company metric." },
        { value: "Healthy", label: "Inventory feed", why: "Health of the ERP/WMS inventory feed.\nGreen means the simulated stream is still updating." },
      ],
      trend: "Below-min items (last 30 min)",
      breakdown: "Stock status mix",
      bars: [
        { label: "OK 71%", w: 210, color: "#1D6EE4" },
        { label: "Watch 18%", w: 90, color: "#FFCA5E" },
        { label: "Short 11%", w: 60, color: "#E54A24" },
      ],
      feed: [
        ["good", "OK Clear", `${companyName} warehouse receipt posted for primary ingredient.`],
        ["warn", "Watch", "Supplier ASN delayed 40 minutes — still inside buffer."],
        ["bad", "Act Short", `Finished-goods SKU 882 below min versus ${domain} demand.`],
        ["good", "OK Clear", "Planner queue refreshed from ERP."],
      ],
      button: "Simulate a stockout risk",
      event: `Simulated stockout risk for ${companyName} — planning alert posted.`,
    };
  }

  return {
    kpis: [
      { value: "18", label: "Open exceptions", why: "Live exceptions that need a person to look now.\nDelayed action costs time and money." },
      { value: "96.4%", label: "On-time signal", why: "Share of events processed within the target window.\nLeaders use this to see if operations are staying on track." },
      { value: "42h", label: "Time recovered", why: "Estimated hours saved this week by catching issues earlier.\nThis is illustrative, not a live company metric." },
      { value: "Healthy", label: "Feed status", why: "Health of the data feed behind this view.\nGreen means the simulated stream is still updating." },
    ],
    trend: "Live exception trend",
    breakdown: "Status breakdown",
    bars: [
      { label: "Clear 54%", w: 180, color: "#1D6EE4" },
      { label: "Watch 28%", w: 110, color: "#FFCA5E" },
      { label: "Act 18%", w: 70, color: "#E54A24" },
    ],
    feed: [
      ["good", "OK Clear", `${companyName} line 3 back within target after a short slowdown.`],
      ["warn", "Watch", "Supplier feed delayed by 4 minutes — still inside buffer."],
      ["bad", "Act", `Quality check skipped on a ${domain} batch. Owner assigned.`],
      ["good", "OK Clear", "Inventory signal refreshed from the warehouse system."],
    ],
    button: "Simulate a notable event",
    event: `Simulated event raised for ${companyName} — a new exception needs review.`,
  };
}

export function fallbackTabFragment({ companyName, domain, useCase, tabId }) {
  const copy = dashboardCopy(companyName, domain, useCase);
  const title = escapeHtml(useCase.title || "Use case");
  const problem = escapeHtml(useCase.businessProblem || "");
  const kpis = copy.kpis
    .map(
      (k, i) => `<div class="kpi-card">
      <button class="info-btn" onclick="toggleInfo('${tabId}-info-${i}')">i</button>
      <div id="${tabId}-info-${i}" class="info-popover">${escapeHtml(k.why).replace(/\n/g, "<br/>")}</div>
      <div class="kpi-value" data-kpi="${i === 0 ? "a" : i === 1 ? "b" : ""}">${escapeHtml(k.value)}</div>
      <div class="kpi-label">${escapeHtml(k.label)}</div>
    </div>`
    )
    .join("\n");
  const bars = copy.bars
    .map(
      (b) =>
        `<rect x="20" y="${20 + copy.bars.indexOf(b) * 30}" width="${b.w}" height="18" fill="${b.color}"></rect>
        <text x="${b.w + 30}" y="${34 + copy.bars.indexOf(b) * 30}" fill="#8EC8FF" font-size="12">${escapeHtml(b.label)}</text>`
    )
    .join("\n");
  const feed = copy.feed
    .map(
      ([kind, label, text]) =>
        `<div class="feed-item"><span class="status-badge status-${kind}">${escapeHtml(label)}</span> ${escapeHtml(text)}</div>`
    )
    .join("\n");

  return `<div data-live="${escapeHtml(copy.event)}">
  <p class="kpi-label" style="margin:0 0 12px">${title}. ${problem}</p>
  <div class="kpi-row">
    ${kpis}
  </div>
  <div class="grid-2">
    <div class="chart-card">
      <button class="info-btn" onclick="toggleInfo('${tabId}-info-trend')">i</button>
      <div id="${tabId}-info-trend" class="info-popover">A live trend for this use case over the last few minutes.<br/>Watch the line move to see the simulated stream.</div>
      <div class="kpi-label">${escapeHtml(copy.trend)}</div>
      <svg class="live-line" viewBox="0 0 320 120" width="100%" height="120" aria-hidden="true">
        <path d="M0,80 L50,70 L100,74 L150,58 L200,62 L250,48 L320,52" fill="none" stroke="#75A2ED" stroke-width="3"></path>
      </svg>
    </div>
    <div class="chart-card">
      <button class="info-btn" onclick="toggleInfo('${tabId}-info-bar')">i</button>
      <div id="${tabId}-info-bar" class="info-popover">How today's items split by status.<br/>Read the bar labels, not color alone.</div>
      <div class="kpi-label">${escapeHtml(copy.breakdown)}</div>
      <svg viewBox="0 0 320 120" width="100%" height="120" aria-hidden="true">${bars}</svg>
    </div>
  </div>
  <div class="feed-list" data-feed>
    ${feed}
  </div>
  <button class="control-btn" type="button">${escapeHtml(copy.button)}</button>
</div>`;
}
