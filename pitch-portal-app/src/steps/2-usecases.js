import { allowLocalFallback } from "../lib/azureAgentClient.js";
import { fallbackUseCases } from "../lib/fallbacks.js";
import { BRIEF_FIRST_RULE, defaultTechStack, normalizeArchitecture } from "../lib/briefFirst.js";
import { runReasoning } from "../lib/reasoningPasses.js";
import { TONE_RULE, lintUseCases } from "../lib/toneGuard.js";
import { clampCount, MAX_SCREENS, MIN_SCREENS } from "../lib/designContract.js";

export const PACKAGE_SCHEMA = `{"deckKicker":"","deckTitle":"","deckSubtitle":"","closeLine":"","architecture":{"title":"","subtitle":"","sources":[{"name":""}],"stages":[{"title":"","steps":[""]}],"target":{"name":"","components":[""]},"guards":[{"n":"","title":"","body":""}]},"useCases":[{"title":"","subtitle":"","challenge":"","businessProblem":"","benefit":"","solutionFit":"","solutionMoves":[{"lead":"","detail":""}],"worksWith":[""],"businessValue":[""],"proofPoint":"","whatItShows":"","whyItMatters":"","action":"","lookFirst":"","blocks":["table"],"columns":[],"zones":[],"entities":[],"steps":[],"recordKind":"","slideLayout":"challenge|impact|shift|journey|evidence","screenHtml":"","slide":{"idea":"","regions":[{"kind":"quote|list|pair|steps|kpis|callout|split|compare","span":12,"kicker":"","title":"","body":"","items":[""],"accent":""}]},"kpis":[{"name":"","why":""}],"dataPointer":{"description":"","availability":"existing|new","confidence":"confirmed|industry-typical"},"difficulty":"easier|moderate|harder","difficultyWhy":"","techComponents":[],"demoScore":9}],"overallBenefits":["","",""],"hub":{"title":"","subtitle":"","whatItShows":"","screenHtml":"","kpis":[{"name":"","value":"","why":"","from":""}]}}`;

function clip(text, maxChars) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars).replace(/\s+\S*$/, "");
}

function sentences(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// The pitch fails when the model answers in 3-word fragments. Each explanatory
// field falls back to real prose built from the neighbouring fields.
function paragraph(primary, fallbacks, maxChars, minChars) {
  const candidates = [primary, ...fallbacks].map((t) => String(t || "").replace(/\s+/g, " ").trim());
  let out = "";
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (out && out.toLowerCase().includes(candidate.slice(0, 24).toLowerCase())) continue;
    out = out ? `${out} ${candidate}` : candidate;
    if (out.length >= minChars) break;
  }
  return clip(out, maxChars);
}

function moveList(raw, fallbackList, uc) {
  const list = Array.isArray(raw) ? raw : [];
  const cleaned = list
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        const parts = sentences(item);
        if (!parts.length) return null;
        const lead = parts.length > 1 ? parts[0] : item.split(/[:\u2014-]/)[0];
        const detail = parts.length > 1 ? parts.slice(1).join(" ") : item;
        return { lead: clip(lead, 26), detail: clip(detail, 190) };
      }
      const lead = clip(item.lead || item.title || item.name, 26);
      const detail = clip(item.detail || item.body || item.text, 190);
      if (!lead && !detail) return null;
      return { lead: lead || "The move", detail: detail || lead };
    })
    .filter((m) => m && m.detail && m.detail.split(" ").length >= 4)
    .slice(0, 3);
  if (cleaned.length >= 2) return cleaned;
  if (Array.isArray(fallbackList) && fallbackList.length) return fallbackList;
  const benefit = uc.benefit || uc.solutionFit || "";
  return [
    { lead: "See it in time", detail: paragraph(benefit, [uc.businessProblem], 190, 60) },
    { lead: "Act on it", detail: paragraph(uc.action, [uc.solutionFit, benefit], 190, 60) },
  ];
}

function bulletList(raw, fallbackList, maxChars, count) {
  const list = (Array.isArray(raw) ? raw : [])
    .map((item) => clip(typeof item === "string" ? item : item?.text || item?.name, maxChars))
    .filter((s) => s && s.split(" ").length >= 3)
    .slice(0, count);
  if (list.length) return list;
  return (fallbackList || []).slice(0, count);
}

function normalizeUseCase(uc, i, fallbackUc, requirement = "", domain = "") {
  const kpis = Array.isArray(uc.kpis)
    ? uc.kpis
        .filter((k) => k?.name)
        .slice(0, 4)
        .map((k, ki) => ({
          name: clip(k.name, 30),
          why: paragraph(
            k.why,
            [fallbackUc?.kpis?.[ki]?.why, "Leadership watches this to know whether the change is working."],
            120,
            45
          ),
        }))
    : fallbackUc?.kpis || [];
  const difficulty = ["easier", "moderate", "harder"].includes(uc.difficulty)
    ? uc.difficulty
    : fallbackUc?.difficulty || "moderate";
  const businessProblem = paragraph(uc.businessProblem, [fallbackUc?.businessProblem], 260, 90);
  const benefit = paragraph(uc.benefit, [uc.solutionFit, fallbackUc?.benefit], 240, 80);
  const challenge = paragraph(
    uc.challenge,
    [businessProblem, fallbackUc?.challenge, fallbackUc?.businessProblem],
    340,
    150
  );

  return {
    title: clip(uc.title || fallbackUc?.title || `Use case ${i + 1}`, 60),
    subtitle: paragraph(uc.subtitle, [uc.lookFirst, benefit], 90, 30),
    businessProblem,
    benefit,
    solutionFit: clip(uc.solutionFit || fallbackUc?.solutionFit || "", 200),
    challenge,
    solutionMoves: moveList(uc.solutionMoves || uc.howWeSolve, fallbackUc?.solutionMoves, {
      benefit,
      businessProblem,
      action: uc.action,
      solutionFit: uc.solutionFit,
    }),
    worksWith: bulletList(
      uc.worksWith,
      fallbackUc?.worksWith || ["Reads the systems this team already runs — nothing is ripped out."],
      110,
      3
    ),
    businessValue: bulletList(
      uc.businessValue,
      fallbackUc?.businessValue || sentences(benefit).slice(0, 3),
      110,
      3
    ),
    proofPoint: paragraph(uc.proofPoint, [fallbackUc?.proofPoint], 220, 0),
    kpis,
    dataPointer: {
      description: paragraph(
        typeof uc.dataPointer === "string" ? uc.dataPointer : uc.dataPointer?.description,
        [fallbackUc?.dataPointer?.description],
        200,
        50
      ),
      availability:
        (typeof uc.dataPointer === "object" && uc.dataPointer?.availability) ||
        fallbackUc?.dataPointer?.availability ||
        "existing",
      confidence:
        (typeof uc.dataPointer === "object" && uc.dataPointer?.confidence) ||
        fallbackUc?.dataPointer?.confidence ||
        "industry-typical",
    },
    difficulty,
    difficultyWhy: paragraph(uc.difficultyWhy, [fallbackUc?.difficultyWhy], 180, 40),
    techComponents: stackForBrief(uc.techComponents, fallbackUc?.techComponents, requirement, domain),
    demoScore: uc.demoScore || 8 - i,
    whatItShows: paragraph(uc.whatItShows, [uc.lookFirst, businessProblem], 230, 80),
    whyItMatters: paragraph(uc.whyItMatters, [businessProblem, challenge], 240, 90),
    action: paragraph(uc.action, [benefit, uc.solutionFit], 230, 80),
    lookFirst: clip(uc.lookFirst || uc.title || "", 48),
    blocks: Array.isArray(uc.blocks) ? uc.blocks : uc.tabLayout ? [uc.tabLayout] : [],
    columns: Array.isArray(uc.columns) ? uc.columns.map((c) => clip(c, 18)).slice(0, 4) : [],
    zones: Array.isArray(uc.zones) ? uc.zones.map((z) => clip(z, 18)).slice(0, 6) : [],
    entities: Array.isArray(uc.entities) ? uc.entities.map((e) => clip(typeof e === "string" ? e : e?.name, 22)).filter(Boolean).slice(0, 6) : [],
    steps: Array.isArray(uc.steps) ? uc.steps.map((s) => clip(s, 36)).filter(Boolean).slice(0, 4) : [],
    recordKind: clip(uc.recordKind || "", 24),
    slideLayout: String(uc.slideLayout || "").toLowerCase().trim(),
    screenHtml: typeof uc.screenHtml === "string" ? uc.screenHtml.slice(0, 14000) : "",
    slide: normalizeSlide(uc.slide),
  };
}

function normalizeSlide(raw) {
  if (!raw || typeof raw !== "object") return { idea: "", regions: [] };
  const regions = (Array.isArray(raw.regions) ? raw.regions : [])
    .map((r) => ({
      kind: String(r?.kind || "pair").toLowerCase().trim(),
      span: Number(r?.span) || 6,
      kicker: clip(r?.kicker, 28),
      title: clip(r?.title, 42),
      body: clip(r?.body, 280),
      items: (Array.isArray(r?.items) ? r.items : []).map((s) => clip(s, 140)).filter(Boolean).slice(0, 5),
      accent: ["good", "warn", "accent", "mute"].includes(r?.accent) ? r.accent : "",
    }))
    .slice(0, 4);
  return { idea: clip(raw.idea, 90), regions };
}

const SAMPLE_VALUES = ["18", "96%", "4.2h", "3", "12", "99%"];

export function normalizeHub(raw, useCases, companyName, domain) {
  const kpis = (useCases || []).slice(0, 6).map((uc, i) => {
    const named = uc.kpis?.[0];
    const fromAgent = Array.isArray(raw?.kpis)
      ? raw.kpis.find(
          (k) =>
            String(k?.from || "").toLowerCase() === String(uc.title || "").toLowerCase() ||
            String(k?.name || "").toLowerCase() === String(named?.name || "").toLowerCase()
        ) || raw.kpis[i]
      : null;
    return {
      name: clip(fromAgent?.name || named?.name || uc.title, 30),
      value: clip(fromAgent?.value || SAMPLE_VALUES[i] || "—", 12),
      why: paragraph(
        fromAgent?.why,
        [named?.why, uc.whyItMatters, "Leadership watches this to know whether this job is holding."],
        120,
        24
      ),
      from: clip(uc.title, 60),
    };
  });
  return {
    title: clip(raw?.title || `${companyName} operating picture`, 64),
    subtitle: clip(raw?.subtitle || `What ${domain} leadership would watch this morning`, 90),
    whatItShows: paragraph(
      raw?.whatItShows,
      ["The numbers from each job on the slides, and the next exception that still needs a person."],
      140,
      40
    ),
    screenHtml: typeof raw?.screenHtml === "string" ? raw.screenHtml.slice(0, 14000) : "",
    kpis,
  };
}

const DECK_LAYOUTS = ["challenge", "impact", "shift", "journey", "evidence"];

// Guarantee neighbouring slides differ even when the agent picks the same
// layout for everything, which is what made all five look identical.
function spreadLayouts(useCases) {
  const used = new Set();
  useCases.forEach((uc, i) => {
    const asked = DECK_LAYOUTS.includes(uc.slideLayout) ? uc.slideLayout : null;
    let chosen = asked && !used.has(asked) ? asked : null;
    if (!chosen) {
      chosen =
        DECK_LAYOUTS.find((l) => !used.has(l) && l !== useCases[i - 1]?.slideLayout) ||
        DECK_LAYOUTS[i % DECK_LAYOUTS.length];
    }
    used.add(chosen);
    if (used.size === DECK_LAYOUTS.length) used.clear();
    uc.slideLayout = chosen;
  });
  return useCases;
}

function stackForBrief(list, fallbackList, requirement, domain) {
  const t = `${requirement || ""}`.toLowerCase();
  const raw = (Array.isArray(list) && list.length ? list : fallbackList) || [];
  const filtered = raw.filter((name) => {
    const n = String(name || "").toLowerCase();
    if (/fabric|onelake|harness/.test(n) && !/fabric|onelake|harness/.test(t)) return false;
    return Boolean(name);
  });
  return (filtered.length ? filtered : defaultTechStack(requirement, domain)).slice(0, 3);
}

function normalizeDeckCopy(parsed, fallback, companyName, domain, requirement) {
  return {
    deckKicker: clip(parsed.deckKicker || fallback.deckKicker || companyName, 28),
    deckTitle: clip(parsed.deckTitle || fallback.deckTitle || `${companyName} operating picture`, 64),
    deckSubtitle: clip(parsed.deckSubtitle || fallback.deckSubtitle || requirement || domain, 110),
    closeLine: clip(parsed.closeLine || fallback.closeLine || `Walk the live demonstration with ${companyName} next.`, 90),
  };
}

export async function generateUseCases({
  companyName,
  domain,
  requirement,
  research,
  numUseCases = 0,
  numMockupTabs = 0,
  onStep,
}) {
  if (!companyName || !domain || !requirement || !research) {
    throw new Error(
      "generateUseCases requires companyName, domain, requirement, and research"
    );
  }

  const asked = numUseCases ? clampCount(numUseCases, 5) : 0;
  const fallbackCount = asked || 5;
  const fallback = fallbackUseCases({
    companyName,
    domain,
    requirement,
    numUseCases: fallbackCount,
    numMockupTabs: numMockupTabs || fallbackCount,
  });

  const draftPrompt = (reasoning, n) => {
    const count = n || asked || 5;
    return `${BRIEF_FIRST_RULE}

You are an Apexon pre-sales lead preparing a 20-minute boardroom pitch for ${companyName} (${domain}).

Verified research (treat industry-typical items as unconfirmed):
${String(research).slice(0, 3200)}

Mandate: "${requirement}"

Your own analysis of this brief so far — build on it, do not start over:
${reasoning || "(none available; reason from the mandate and research above)"}

Now write the pitch content for the selected use cases.

WRITE IN FULL SENTENCES. This is the most important instruction. Label fragments like "Payment success", "Ask clarifier", or "Less time to pay" are a FAILED answer — a reader who knows nothing about this project must understand the use case from your text alone. Explain, do not label.

For EVERY use case, explain the whole story the way a solution architect would on a slide:
- challenge: 2-3 sentences on what goes wrong today, in their operation, with the consequence. Name the systems, roles, and moment it happens.
- solutionMoves: 3 named moves. Each has a short lead ("See it live", "Act instantly", "Work with what you run") and a full-sentence detail explaining what the capability actually does for them.
- worksWith: 2-3 sentences on how this sits alongside the systems they already run, so nothing is ripped out.
- businessValue: 3 sentences on the business outcome — money, risk, time, or experience. Not adjectives.
- dataPointer.description: a sentence naming the data this needs and where it usually lives.
- kpis: exactly 4. Each name is the metric; each why is a full sentence saying what the metric tells leadership and why it moves with this change.
- proofPoint: one sentence of industry evidence or a comparable pattern, only if you are confident. Otherwise "".

${TONE_RULE}

Choose a slideLayout for EACH use case — pick the one that suits ITS story, and vary it across the set so no two neighbouring slides look alike:
- "challenge" — the problem is the point. Use when the pain is the compelling part.
- "impact" — the metrics are the point. Use when leadership cares about the numbers moving.
- "shift" — today versus after, side by side. Use when the change in the way of working is the point.
- "journey" — the sequence of steps. Use when the story is a path or flow.
- "evidence" — data, effort, and what is proven. Use when feasibility is the real question.
Each layout shows only PART of the content, so the slide stays readable. Write all fields anyway.

Then design ONE leadership HTML screen — not a tab per use case. The deck tells each job. The HTML is the product a leader would leave open: those jobs' KPIs on one strip, plus one working view.
- hub.title: max 8 words, what this screen is called in their language.
- hub.subtitle: 6-12 words, the promise of the view.
- hub.whatItShows: ONE sentence, 12-22 words — the only caption the screen gets.
- hub.kpis: one KPI per use case (name + sample value + why). Sample numbers only, never claimed as live.
- hub.screenHtml: the working view under the KPIs. HARD LAYOUT: a row with EXACTLY two children (article.viz = the work, article.side = the next move). One working view — a board OR a table OR a heat map, not all three. Do not restate the deck.

Then compose each PowerPoint slide in slide.regions — 1-4 regions, kinds quote|list|pair|steps|kpis|callout|split|compare, spans 4, 6, or 12. Neighbouring slides must differ.

Primitives (fallback only, if hub.screenHtml is rejected):
- kpis, bars, alerts, table, heat, record, actions, flow, compare (before/after), timeline (their process steps), entities (tiles for their objects)

Put a product or platform name in techComponents, flow, or labels only if the requirement itself names one. Otherwise describe the capability in plain words.

Also design architecture for THIS mandate: sources they run, 2-3 stages named for their process, target = platform named in the requirement (or "Target platform" if none), guards only if this brief is about governance.

Return ONLY JSON:
${PACKAGE_SCHEMA}

Length guidance — these are MINIMUMS for the explanatory fields, so write enough to be understood:
- challenge: 35-55 words. At least 2 sentences.
- solutionMoves: exactly 3. lead 2-4 words. detail 18-30 words, a complete sentence.
- worksWith: 2-3 items, 10-18 words each, full sentences.
- businessValue: 3 items, 10-18 words each, full sentences.
- kpis: exactly 4. name 2-4 words. why 12-20 words, a full sentence. No invented current numbers.
- dataPointer.description: 12-25 words.
- difficultyWhy: 12-25 words.
- whatItShows: 12-22 words, ONE sentence. whyItMatters / action: 12-22 words each.
- slideLayout: exactly one of challenge, impact, shift, journey, evidence. Vary across use cases.
- businessProblem: 25-40 words. benefit: 20-35 words.
- title: max 9 words. subtitle: 6-12 words, the promise of this use case.
- deckKicker: max 4 words. deckTitle: max 9 words. deckSubtitle: max 18 words. closeLine: max 18 words.
- architecture.stages: 2-3 titles, each 2-6 short steps.
- architecture.target.name: only a platform named in the mandate, else "Operating platform".
- lookFirst: max 8 words. blocks: 1-3 primitive names for the hub fallback only.
- hub.title: max 8 words. hub.whatItShows: 12-22 words, one sentence.
- columns / zones / entities / steps: named for THIS process when used.
- overallBenefits: exactly 4 lines, 12-20 words each.
- techComponents: max 3 names from this mandate only.

Leave useCases[].screenHtml empty. The HTML is hub.screenHtml only.

Produce exactly ${count} use cases. Design title, architecture, the one leadership screen, and close from THIS brief. Use-case titles become the agenda.`;
  };

  let parsed = null;
  let verification = null;
  let trace = null;
  let source = "fallback";

  try {
    const outcome = await runReasoning({
      companyName,
      domain,
      requirement,
      research,
      count: asked,
      draft: null,
      draftPrompt,
      schema: PACKAGE_SCHEMA,
      onStep,
    });
    parsed = outcome.result;
    verification = outcome.verification;
    trace = outcome.trace;
    if (parsed) source = "azure";
  } catch (err) {
    if (!allowLocalFallback()) {
      throw new Error(
        `Azure AI Foundry failed while reasoning about this brief (${err?.message || err}). The live portal does not publish generic fallback use cases.`
      );
    }
    console.warn(`generateUseCases: reasoning pipeline failed (${err?.message || err}).`);
  }

  if (parsed) {
    try {
      const list = Array.isArray(parsed.useCases)
        ? parsed.useCases
        : Array.isArray(parsed)
          ? parsed
          : [];
      const want = asked || clampCount(list.length, 5);
      const tabs = numMockupTabs || want;
      const useCases = list
        .filter((uc) => uc?.title && uc?.businessProblem)
        .slice(0, want)
        .map((uc, i) => normalizeUseCase(uc, i, fallback.useCases[i], requirement, domain));
      if (useCases.length >= MIN_SCREENS) {
        spreadLayouts(useCases);
        attachEvidence(useCases, verification);
        const hub = normalizeHub(parsed.hub, useCases, companyName, domain);
        return {
          useCases,
          hub,
          topForMockup: useCases.slice(0, tabs).map((uc) => uc.title),
          overallBenefits: Array.isArray(parsed.overallBenefits)
            ? parsed.overallBenefits.map((s) => clip(String(s), 130)).filter(Boolean).slice(0, 4)
            : fallback.overallBenefits,
          ...normalizeDeckCopy(parsed, fallback, companyName, domain, requirement),
          architecture: normalizeArchitecture(parsed.architecture, {
            companyName,
            domain,
            requirement,
            researchStructured: typeof research === "object" ? research : null,
            useCases,
          }),
          evidenceNote: clip(verification?.evidenceNote || "", 200),
          reasoning: trace,
          source,
        };
      }
    } catch (err) {
      console.warn("generateUseCases: could not use the reasoned package.", err.message);
    }
  }

  if (!allowLocalFallback()) {
    throw new Error(
      "Azure AI Foundry did not return usable company-specific use cases. Submit the brief again."
    );
  }

  return {
    ...fallback,
    useCases: spreadLayouts(fallback.useCases || []),
    hub: normalizeHub(fallback.hub, fallback.useCases || [], companyName, domain),
    source: "fallback",
  };
}

// Claims are labelled, never silently upgraded. An honest "industry-typical"
// is what leadership needs; unlabelled content is marked as unverified.
function attachEvidence(useCases, verification) {
  const byTitle = new Map(
    (verification?.useCases || []).map((entry) => [String(entry.title || "").toLowerCase().trim(), entry])
  );
  useCases.forEach((uc) => {
    const match =
      byTitle.get(String(uc.title).toLowerCase().trim()) ||
      (verification?.useCases || []).find((e) =>
        String(e.title || "").toLowerCase().includes(String(uc.title).toLowerCase().slice(0, 18))
      );
    const assumptions = (match?.assumptions || [])
      .map((a) => ({
        claim: clip(a.claim, 130),
        confidence: a.confidence === "confirmed" ? "confirmed" : "industry-typical",
        basis: clip(a.basis, 130),
      }))
      .filter((a) => a.claim)
      .slice(0, 3);
    uc.assumptions = assumptions.length
      ? assumptions
      : [
          {
            claim: "Details of this operation were not independently confirmed.",
            confidence: "industry-typical",
            basis: "Treat as typical for this industry until validated with the client.",
          },
        ];
  });
}

export function selectTopUseCases(useCasesResult) {
  const { useCases, topForMockup } = useCasesResult;
  const picked = (topForMockup || [])
    .map((title) => useCases.find((uc) => uc.title === title))
    .filter(Boolean);
  if (picked.length) return picked;
  return (useCases || []).slice(0, MAX_SCREENS);
}
