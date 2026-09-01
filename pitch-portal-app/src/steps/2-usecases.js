import { allowLocalFallback } from "../lib/azureAgentClient.js";
import { fallbackUseCases } from "../lib/fallbacks.js";
import { BRIEF_FIRST_RULE, defaultTechStack, normalizeArchitecture } from "../lib/briefFirst.js";
import { runReasoning } from "../lib/reasoningPasses.js";
import { TONE_RULE } from "../lib/toneGuard.js";
import { clampCount, MAX_SCREENS, MIN_SCREENS } from "../lib/designContract.js";
import { composeHubVisual, lockUseCases } from "../lib/composeVisuals.js";
import { fitTitle, isChatRequest } from "../lib/text.js";

export const PACKAGE_SCHEMA = `{"deckKicker":"","deckTitle":"","deckSubtitle":"","closeLine":"","architecture":{"title":"","subtitle":"","sources":[{"name":""}],"stages":[{"title":"","steps":[""]}],"target":{"name":"","components":[""]},"guards":[{"n":"","title":"","body":""}]},"useCases":[{"title":"","subtitle":"","challenge":"","businessProblem":"","benefit":"","solutionFit":"","solutionMoves":[{"lead":"","detail":""}],"worksWith":[""],"businessValue":[""],"proofPoint":"","whatItShows":"","whyItMatters":"","action":"","lookFirst":"","persona":"","decision":"","insight":"","kpis":[{"name":"","why":""}],"dataPointer":{"description":"","availability":"existing|new","confidence":"confirmed|industry-typical"},"difficulty":"easier|moderate|harder","difficultyWhy":"","techComponents":[]}],"overallBenefits":["","",""],"hub":{"title":"","subtitle":"","whatItShows":"","visual":{"kind":"table|heat|board|compare|flow","heading":"","columns":[""],"rows":[[""]],"cells":[{"label":"","state":"warn","note":""}],"lanes":[{"title":"","body":""}],"before":"","after":"","steps":[""],"actions":[""]},"kpis":[{"name":"","value":"","why":"","from":""}]}}`;

function clip(text, maxChars) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^an industry-typical hypothesis is that\s+/i, "");
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars).replace(/\s+\S*$/, "");
}

function spokenWhy(name, why) {
  const t = String(why || "").replace(/\s+/g, " ").trim();
  if (/must (establish|define|confirm)|industry-typical hypothesis|give me the use case/i.test(t)) {
    return `If ${clip(name, 24)} moves the wrong way, this job misses its window.`;
  }
  return t.replace(/^an industry-typical hypothesis is that\s+/i, "");
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
function takeCopy(primary, extras, maxChars) {
  const first = clip(primary, maxChars);
  if (first) return first;
  for (const extra of extras || []) {
    const next = clip(extra, maxChars);
    if (next) return next;
  }
  return "";
}

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

function normalizeUseCase(uc, i, fallbackUc, requirement = "", domain = "", { fromFallback = false } = {}) {
  const copy = fromFallback
    ? (primary, extras, max, min) => paragraph(primary, extras, max, min)
    : (primary, extras, max) => takeCopy(primary, extras, max);

  const kpis = Array.isArray(uc.kpis)
    ? uc.kpis
        .filter((k) => k?.name)
        .slice(0, 4)
        .map((k, ki) => ({
          name: clip(k.name, 30),
          why: spokenWhy(
            k.name,
            copy(
              k.why,
              fromFallback
                ? [fallbackUc?.kpis?.[ki]?.why]
                : [`If ${clip(k.name, 24)} moves the wrong way, this job misses its window.`],
              120,
              45
            )
          ),
        }))
    : fallbackUc?.kpis || [];
  const difficulty = ["easier", "moderate", "harder"].includes(uc.difficulty)
    ? uc.difficulty
    : fallbackUc?.difficulty || "moderate";
  const businessProblem = copy(uc.businessProblem, fromFallback ? [fallbackUc?.businessProblem] : [], 260, 90);
  const benefit = copy(uc.benefit, [uc.solutionFit, fromFallback ? fallbackUc?.benefit : ""], 240, 80);
  const challenge = copy(
    uc.challenge,
    fromFallback ? [businessProblem, fallbackUc?.challenge] : [businessProblem],
    340,
    150
  );

  return {
    title: clip(fitTitle(uc.title || fallbackUc?.title || `Use case ${i + 1}`, 8) || `Use case ${i + 1}`, 60),
    subtitle: copy(uc.subtitle, [uc.lookFirst, benefit], 90, 30),
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
    proofPoint: copy(uc.proofPoint, fromFallback ? [fallbackUc?.proofPoint] : [], 220, 0),
    kpis,
    dataPointer: {
      description: copy(
        typeof uc.dataPointer === "string" ? uc.dataPointer : uc.dataPointer?.description,
        fromFallback ? [fallbackUc?.dataPointer?.description] : [],
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
    difficultyWhy: copy(uc.difficultyWhy, fromFallback ? [fallbackUc?.difficultyWhy] : [], 180, 40),
    techComponents: stackForBrief(uc.techComponents, fallbackUc?.techComponents, requirement, domain),
    demoScore: uc.demoScore || 8 - i,
    whatItShows: copy(uc.whatItShows, [uc.lookFirst, businessProblem], 230, 80),
    whyItMatters: copy(uc.whyItMatters, [businessProblem, challenge], 240, 90),
    action: copy(uc.action, [benefit, uc.solutionFit], 230, 80),
    lookFirst: clip(uc.lookFirst || uc.title || "", 48),
    persona: clip(uc.persona || "", 48),
    decision: clip(uc.decision || "", 90),
    insight: clip(uc.insight || "", 140),
    primaryKpi: clip(uc.primaryKpi || "", 40),
    signals: (Array.isArray(uc.signals) ? uc.signals : []).map((s) => clip(s, 48)).filter(Boolean).slice(0, 4),
    dimensions: (Array.isArray(uc.dimensions) ? uc.dimensions : []).map((s) => clip(s, 28)).filter(Boolean).slice(0, 4),
    exceptionRule: clip(uc.exceptionRule || "", 90),
    businessImpact: clip(uc.businessImpact || "", 120),
    blocks: Array.isArray(uc.blocks) ? uc.blocks : uc.tabLayout ? [uc.tabLayout] : [],
    columns: Array.isArray(uc.columns) ? uc.columns.map((c) => clip(c, 18)).slice(0, 4) : [],
    zones: Array.isArray(uc.zones) ? uc.zones.map((z) => clip(z, 18)).slice(0, 6) : [],
    entities: Array.isArray(uc.entities) ? uc.entities.map((e) => clip(typeof e === "string" ? e : e?.name, 22)).filter(Boolean).slice(0, 6) : [],
    steps: Array.isArray(uc.steps) ? uc.steps.map((s) => clip(s, 36)).filter(Boolean).slice(0, 4) : [],
    recordKind: clip(uc.recordKind || "", 24),
    slideLayout: String(uc.slideLayout || "").toLowerCase().trim(),
    screenHtml: "",
    slide: { idea: clip(uc.slide?.idea || uc.insight || uc.decision || uc.subtitle, 90), regions: [] },
  };
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
      why: takeCopy(fromAgent?.why, [named?.why, uc.whyItMatters], 120) ||
        `If ${clip(named?.name || "this number", 24)} moves the wrong way, this job misses its window.`,
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
    screenHtml: "",
    visual: composeHubVisual(raw?.visual, useCases),
    visualConcept: clip(raw?.visualConcept || "", 48),
    decision: clip(raw?.decision || "", 90),
    kpis,
  };
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
  const subtitle =
    parsed.deckSubtitle && !isChatRequest(parsed.deckSubtitle)
      ? parsed.deckSubtitle
      : fallback.deckSubtitle && !isChatRequest(fallback.deckSubtitle)
        ? fallback.deckSubtitle
        : `The decisions ${companyName} leadership should take first.`;
  return {
    deckKicker: clip(parsed.deckKicker || fallback.deckKicker || companyName, 28),
    deckTitle: clip(parsed.deckTitle || fallback.deckTitle || `${companyName} operating picture`, 64),
    deckSubtitle: clip(isChatRequest(subtitle) ? `The decisions ${companyName} leadership should take first.` : subtitle, 140),
    closeLine: clip(parsed.closeLine || fallback.closeLine || `Walk the live demonstration with ${companyName} next.`, 110),
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

You are an Apexon enterprise pitch strategist preparing a 20-minute boardroom pitch for ${companyName} (${domain}). Think like a consultant; write like a person in the room.

Verified research (treat industry-typical items as unconfirmed):
${String(research).slice(0, 3200)}

Mandate: "${requirement}"
${isChatRequest(requirement)
  ? `The mandate above is informal. Do NOT put those words on a slide. Restate it as the business decision ${companyName} must take. A visitor who was not in the request should still understand the pitch.`
  : ""}

Your own analysis of this brief so far — build on it, do not start over:
${reasoning || "(none available; reason from the mandate and research above)"}

Design the BUSINESS STORY first, then the copy. For every use case: who uses it, what problem, what decision, what evidence, what insight, what action, what outcome. Do not open with technology.

WRITE IN FULL SENTENCES. This is the most important instruction. Label fragments like "Payment success", "Ask clarifier", or "Less time to pay" are a FAILED answer — a reader who knows nothing about this project must understand the use case from your text alone. Explain, do not label.

Reject generic titles (dashboard, chatbot, 360, insights, predictive analytics). Name the decision. Titles: max 8 words, a complete phrase a VP can say out loud — never cut off on "the" or "before".

Never start a sentence with "An industry-typical hypothesis is that". Put evidence labels in the evidence strip, not in the body. KPI why is: if this number moves the wrong way, what breaks. Not a to-do for the client to establish a baseline.

For EVERY use case, explain the whole story the way a solution architect would on a slide:
- challenge: 2-3 sentences on what goes wrong today, in their operation, with the consequence. Name the systems, roles, and moment it happens.
- solutionMoves: 3 named moves. Each has a short lead ("See it live", "Act instantly", "Work with what you run") and a full-sentence detail explaining what the capability actually does for them.
- worksWith: 2-3 sentences on how this sits alongside the systems they already run, so nothing is ripped out.
- businessValue: 3 sentences on the business outcome — money, risk, time, or experience. Not adjectives.
- dataPointer.description: a sentence naming the data this needs and where it usually lives.
- kpis: exactly 4. Each name is the metric; each why is a full sentence saying what the metric tells leadership and why it moves with this change.
- proofPoint: one sentence of industry evidence or a comparable pattern, only if you are confident. Otherwise "".

Write like a person in the room, not a brochure.

BAD: "Leadership watches this to know whether the change is working."
GOOD: "If first-pass yield on the combine line drops below 94%, today's build plan slips before second shift."

BAD: "Issues are caught inside the window where a decision still changes the outcome."
GOOD: "Quality sees the hold while the batch is still on the line, not after it has shipped."

KPI why must be: If this number moves the wrong way, what breaks. Not "leadership watches this."

Do NOT pad short answers with generic industry sentences. Two true sentences beat five interchangeable ones.

${TONE_RULE}

Do not write HTML, CSS, or PowerPoint regions. Code paints the slides and the one leadership screen from this story. Fill hub.title, subtitle, whatItShows, kpis, and hub.visual data only.

hub.visual.kind: table, heat, board, compare, or flow. One fact per table cell. actions: 2-3 next moves, one sentence each.

Put a product or platform name in techComponents only if the requirement itself names one. Otherwise describe the capability in plain words.

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
- businessProblem: 25-40 words. benefit: 20-35 words.
- title: max 9 words. subtitle: 6-12 words, the promise of this use case.
- deckKicker: max 4 words. deckTitle: max 9 words. deckSubtitle: max 18 words. closeLine: max 18 words.
- architecture.stages: 2-3 titles, each 2-6 short steps.
- architecture.target.name: only a platform named in the mandate, else "Operating platform".
- lookFirst: max 8 words.
- hub.title: max 8 words. hub.whatItShows: 12-22 words, one sentence.
- hub.visual.heading: max 8 words. hub.visual.actions: 2-3 sentences.
- overallBenefits: exactly 4 lines, 12-20 words each.
- techComponents: max 3 names from this mandate only.

Produce exactly ${count} use cases. Design title, architecture, hub copy, and close from THIS brief. Use-case titles become the agenda.`;
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
        .map((uc, i) => normalizeUseCase(uc, i, fallback.useCases[i], requirement, domain, { fromFallback: false }));
      if (useCases.length >= MIN_SCREENS) {
        const locked = lockUseCases(useCases);
        attachEvidence(locked, verification);
        const hub = normalizeHub(parsed.hub, locked, companyName, domain);
        return {
          useCases: locked,
          hub,
          topForMockup: locked.slice(0, tabs).map((uc) => uc.title),
          overallBenefits: Array.isArray(parsed.overallBenefits)
            ? parsed.overallBenefits.map((s) => clip(String(s), 130)).filter(Boolean).slice(0, 4)
            : fallback.overallBenefits,
          ...normalizeDeckCopy(parsed, fallback, companyName, domain, requirement),
          architecture: normalizeArchitecture(parsed.architecture, {
            companyName,
            domain,
            requirement,
            researchStructured: typeof research === "object" ? research : null,
            useCases: locked,
          }),
          evidenceNote: clip(verification?.evidenceNote || "", 200),
          storyboard: parsed.storyboard || trace?.uiPlan || null,
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

  const locked = lockUseCases(fallback.useCases || []);
  return {
    ...fallback,
    useCases: locked,
    hub: normalizeHub(fallback.hub, locked, companyName, domain),
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
