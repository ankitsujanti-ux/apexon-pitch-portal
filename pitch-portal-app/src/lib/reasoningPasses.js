// Multi-pass reasoning for the pitch package.
//
// A single generation call cannot deliberate: the model emits its first answer
// and the builder paints it. Instructing it to "think harder" changes nothing
// because nothing inspects whether it did. These passes make the deliberation
// actually run — the brief is framed, options diverge, they are scored (under
// 7.5 is cut), drafted, KPI-modelled, storyboarded (one JSON for PPT and HTML),
// rendered from that storyboard, attacked by a hostile reviewer with numeric
// design scores, revised against those specific defects, and finally every
// factual claim is labelled with its basis.
//
// Every pass degrades gracefully: if a pass cannot be parsed we keep the state
// from the previous pass rather than failing the whole generation.

import { askAgent } from "./azureAgentClient.js";
import { extractJson } from "./parseJson.js";
import { BRIEF_FIRST_RULE } from "./briefFirst.js";
import { TONE_RULE, lintUseCases } from "./toneGuard.js";
import { clampCount } from "./designContract.js";

const NO_PROSE = `Return ONLY the JSON object. No preamble, no markdown fence, no commentary.`;

async function runPass({ label, prompt, onStep }) {
  if (onStep) onStep(label);
  const text = await askAgent(prompt, { retries: 1 });
  return extractJson(text);
}

async function tryPass({ label, prompt, onStep, fallback = null }) {
  try {
    const parsed = await runPass({ label, prompt, onStep });
    console.log(`[reason:${label}] ok`);
    return parsed;
  } catch (err) {
    console.warn(`[reason:${label}] skipped (${err?.message || err}).`);
    return fallback;
  }
}

function lines(list, max = 12) {
  return (Array.isArray(list) ? list : [])
    .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
    .filter(Boolean)
    .slice(0, max)
    .map((s) => `- ${s}`)
    .join("\n");
}

export const SCORE_FLOOR = 7.5;
export const DESIGN_FLOOR = 7;

const SCORE_KEYS = [
  "clientRelevance",
  "industryRelevance",
  "businessValue",
  "executiveRelevance",
  "dataLikely",
  "technologyRelevance",
  "differentiation",
  "visualizationPotential",
  "storytellingPotential",
];

export function scoreAverage(scores) {
  const unique = SCORE_KEYS.map((k) => Number(scores?.[k])).filter((n) => Number.isFinite(n));
  const fallback = Object.values(scores || {})
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const use = unique.length ? unique : fallback;
  if (!use.length) return 0;
  return use.reduce((a, b) => a + b, 0) / use.length;
}

export function keepSelected(selected, min = SCORE_FLOOR) {
  const ranked = (Array.isArray(selected) ? selected : []).map((item) => ({
    ...item,
    average: Number.isFinite(Number(item?.average)) ? Number(item.average) : scoreAverage(item?.scores),
  }));
  const kept = ranked.filter((item) => item.average >= min);
  if (kept.length >= 3) return kept;
  return ranked.sort((a, b) => b.average - a.average).slice(0, Math.max(3, ranked.length));
}

function matchByTitle(list, title) {
  const key = String(title || "").toLowerCase().trim();
  if (!key) return null;
  const rows = Array.isArray(list) ? list : [];
  return (
    rows.find((row) => String(row?.title || "").toLowerCase().trim() === key) ||
    rows.find((row) => String(row?.title || "").toLowerCase().includes(key.slice(0, 16))) ||
    null
  );
}

function applyKpiModel(draft, model) {
  if (!draft || !Array.isArray(draft.useCases) || !Array.isArray(model?.useCases)) return draft;
  return {
    ...draft,
    useCases: draft.useCases.map((uc) => {
      const match = matchByTitle(model.useCases, uc.title);
      if (!match) return uc;
      return {
        ...uc,
        persona: match.persona || uc.persona,
        decision: match.decision || uc.decision,
        insight: match.insight || uc.insight,
        primaryKpi: match.primaryKpi || uc.primaryKpi,
        signals: match.signals || uc.signals,
        dimensions: match.dimensions || uc.dimensions,
        exceptionRule: match.exceptionRule || uc.exceptionRule,
        businessImpact: match.businessImpact || uc.businessImpact,
      };
    }),
  };
}

function applyStoryboard(draft, storyboard) {
  if (!draft || !Array.isArray(draft.useCases) || !storyboard) return draft;
  const next = {
    ...draft,
    storyboard,
    hub: {
      ...(draft.hub || {}),
      visualConcept: storyboard.visualConcept || draft.hub?.visualConcept,
      decision: storyboard.hubPlan?.decision || draft.hub?.decision,
    },
  };
  if (!Array.isArray(storyboard.slides)) return next;
  next.useCases = draft.useCases.map((uc) => {
    const match = matchByTitle(storyboard.slides, uc.title);
    if (!match) return uc;
    return {
      ...uc,
      persona: match.persona || uc.persona,
      decision: match.decision || uc.decision,
      insight: match.insight || uc.insight,
      slide: {
        ...(uc.slide || {}),
        idea: match.idea || uc.slide?.idea || "",
      },
    };
  });
  return next;
}

function designScoreDefects(critique) {
  const scores = critique?.scores && typeof critique.scores === "object" ? critique.scores : {};
  const low = Object.entries(scores)
    .filter(([, v]) => Number.isFinite(Number(v)) && Number(v) < DESIGN_FLOOR)
    .map(([k, v]) => `${k} ${v}`);
  if (!low.length) return [];
  return [
    {
      useCase: "package",
      field: "design",
      kind: "HIERARCHY",
      problem: `Design score below ${DESIGN_FLOOR}: ${low.slice(0, 4).join(", ")}.`,
      fix: "Redesign the weak screen or slide from the storyboard. Cut copy. Do not add more blocks.",
    },
  ];
}

// Pass 1 — interrogate the brief before proposing anything.
export function framePrompt({ companyName, domain, requirement, research }) {
  return `${BRIEF_FIRST_RULE}

You are an Apexon enterprise pitch strategist. Before proposing anything, interrogate the brief. Do not design slides yet.

Company: ${companyName}
Industry: ${domain}
Mandate: "${requirement}"

Research:
${String(research).slice(0, 3000)}

Do not propose solutions yet. Answer only these questions:
1. What is this mandate actually asking for, restated as the BUSINESS DECISION behind it — not a restatement of the request?
2. What must ${companyName} leadership believe by the end of the meeting for this to be a win?
3. Split what we know: knownFacts (public), assumptions (industry-typical), hypotheses (to test). Do not treat gaps as facts.
4. What criteria should we use to judge whether a use case is worth putting on a slide for THIS mandate?
5. What would make this pitch fail, feel generic, or sound like a dashboard catalogue?

${NO_PROSE}
{"mandateRestated":"","leadershipMustBelieve":["",""],"knownFacts":[""],"assumptions":[""],"hypotheses":[""],"unknowns":["",""],"criteria":["",""],"failureModes":["",""]}

mandateRestated: 25-40 words, the decision not the dashboard. leadershipMustBelieve: 2-4 items, 10-20 words each. knownFacts / assumptions / hypotheses: 2-4 each. unknowns: 3-5 honest gaps. criteria: 4-5 judging criteria specific to this mandate. failureModes: 2-3 ways this pitch goes wrong.`;
}

// Pass 2 — diverge widely before narrowing.
export function divergePrompt({ companyName, domain, requirement, research, frame }) {
  return `${BRIEF_FIRST_RULE}

You are walking ${companyName}'s operation in your head — the plant floor, the claims desk, the store, the trading floor, whichever applies to ${domain}.

Mandate: "${requirement}"
Mandate restated: ${frame?.mandateRestated || requirement}
Judging criteria for this brief:
${lines(frame?.criteria)}

Research:
${String(research).slice(0, 2600)}

Generate 12 CANDIDATE use cases. Do not filter yet. Cast wide: obvious operational ones, one or two a competitor would miss, one that is uncomfortable but valuable.

Reject titles that are capabilities, not decisions: Sales Dashboard, Inventory Dashboard, AI Chatbot, Predictive Analytics, Customer 360, Operational Dashboard. Convert those into the specific decision this company must take.

For each candidate: who feels the pain, the business decision, why THIS client, the data, and the honest weakness.

${NO_PROSE}
{"candidates":[{"title":"","job":"","whoFeelsIt":"","decision":"","whyThisClient":"","whyItFitsMandate":"","dataNeeded":"","kpis":"","weakness":""}]}

Exactly 12 candidates. title max 9 words, a decision not a dashboard. job 15-25 words. whoFeelsIt: the actual role. decision 10-18 words. whyThisClient 10-18 words. whyItFitsMandate 12-20 words. dataNeeded 8-16 words. kpis 6-12 words. weakness: 8-16 words.`;
}

// Pass 3 — score against the stated criteria and justify the cut.
export function selectPrompt({ companyName, domain, requirement, frame, candidates, count }) {
  return `${BRIEF_FIRST_RULE}

Score these candidate use cases for ${companyName} (${domain}) against the mandate "${requirement}".

Candidates:
${JSON.stringify(candidates).slice(0, 4000)}

Criteria for this brief:
${lines(frame?.criteria)}

Score each 1-10 on: clientRelevance, industryRelevance, businessValue, executiveRelevance, dataLikely, technologyRelevance, differentiation, visualizationPotential, storytellingPotential.

Compute average as the mean of those nine. Below ${SCORE_FLOOR} is rejected — do not select it even if it is easy to demo. 7.5-8.5 may be selected only if nothing stronger exists. Above 8.5 is preferred.

Then choose how many this brief actually needs. At least 3, at most 7. A tight mandate is 3. A sprawling operation is 6 or 7. Prefer fewer that a leader would remember over padding. If you were asked for a specific count, honour it: ${count ? `choose exactly ${count}.` : "choose the count yourself."}

Reject generic capabilities even if they scored well on visualizationPotential.

${NO_PROSE}
{"selected":[{"title":"","scores":{"clientRelevance":9,"industryRelevance":9,"businessValue":9,"executiveRelevance":8,"dataLikely":7,"technologyRelevance":7,"differentiation":8,"visualizationPotential":8,"storytellingPotential":8},"average":8.1,"whyChosen":""}],"rejected":[{"title":"","average":6.2,"whyNot":""}]}

3 to 7 in selected. whyChosen 15-25 words. Every non-selected candidate appears in rejected with whyNot, 10-20 words.`;
}

// Pass 5 — attack the draft as a hostile reviewer.
export function critiquePrompt({ companyName, domain, requirement, frame, draft }) {
  return `${BRIEF_FIRST_RULE}

You are now a sceptical ${companyName} executive reading this draft, plus an Apexon quality reviewer. Your job is to find what is WRONG. Do not be polite and do not rewrite it.

Mandate: "${requirement}"
What leadership must believe:
${lines(frame?.leadershipMustBelieve)}
Known unknowns about this company:
${lines(frame?.unknowns)}

Draft:
${JSON.stringify(draft).slice(0, 9000)}

Find every instance of:
- LABEL: a field that is a fragment or keyword instead of an explanation a layman could follow.
- GENERIC: a sentence or use case that would read identically for any other company in any other industry.
- UNSUPPORTED: a claim about ${companyName} that the research does not support and that is not flagged as an assumption.
- INVENTED: a specific number, system name, vendor, or metric that was made up.
- SO_WHAT: a screen or KPI where a business reader would ask "why do I care".
- REPEAT: two use cases that are really the same job, or the same visual reused.
- JARGON: a sentence an executive outside this function would have to re-read. Stacked nouns, unexplained terms, consultant filler.
- SAMEY: two slides that use the same visual structure. Neighbouring slides must differ.
- SPARSE: a slide or hub that is too shallow for an executive — missing what is happening, why, where, or what to do.
- HUB: the HTML is not one leadership screen covering the use-case KPIs, or it restates the deck.
- TECH_FIRST: the story opens with technology instead of the business decision.
- DASHBOARD: a title that is a capability (dashboard, chatbot, 360, insights) instead of a decision.
- OVERFLOW: title, cell, or label that will collide or wrap into the next block.
- HIERARCHY: every element has equal visual weight, or there is no one message.
- CROWDED: too many widgets competing on one screen.
- EMPTY: a large region earns no space.
- WEAK_VIZ: the visual does not make the insight faster than text.
- NOVELTY: different for the sake of being different, not because the decision is different.

Also fail the draft if a CIO/CTO/COO would not believe we understand their business, or if it could be reused for another company unchanged.

Then score 1-10: businessSpecificity, industryRelevance, visualOriginality, informationHierarchy, layoutQuality, visualizationQuality, readability, executivePolish. Any score below ${DESIGN_FLOOR} means verdict "revise". Overall under 7.5 is "reject" until fixed. Above 8.5 may "pass" if defects is empty.

Name the exact use case and field for each defect, and say what would fix it.

${NO_PROSE}
{"verdict":"pass|revise|reject","scores":{"businessSpecificity":8,"industryRelevance":8,"visualOriginality":7,"informationHierarchy":8,"layoutQuality":8,"visualizationQuality":8,"readability":8,"executivePolish":8},"defects":[{"useCase":"","field":"","kind":"LABEL|GENERIC|UNSUPPORTED|INVENTED|SO_WHAT|REPEAT|JARGON|SAMEY|SPARSE|HUB|TECH_FIRST|DASHBOARD|OVERFLOW|HIERARCHY|CROWDED|EMPTY|WEAK_VIZ|NOVELTY","problem":"","fix":""}]}

Report every real defect, up to 14. problem and fix: 10-22 words each.`;
}

// Pass 6 — revise against the specific defects, not a vague "improve this".
export function revisePrompt({ companyName, requirement, draft, critique, schema }) {
  return `${BRIEF_FIRST_RULE}

Revise this ${companyName} pitch content. A reviewer found specific defects. Fix each one. Keep everything that was not criticised — do not rewrite working content and do not drop fields.

Mandate: "${requirement}"

Defects to fix:
${JSON.stringify(critique?.defects || []).slice(0, 4000)}

Current draft:
${JSON.stringify(draft).slice(0, 9000)}

${TONE_RULE}

Rules while revising:
- Replace any label fragment with a full explanatory sentence a layman can follow.
- Replace generic sentences with something only true of ${companyName} and this mandate.
- Remove invented numbers, vendors, and system names. If a claim cannot be supported, either cut it or word it as an industry-typical assumption.
- Apply every fix exactly as described. A defect saying to remove a product name means that name must not appear anywhere in your answer.
- Keep the storyboard: PPT slides and the HTML hub must still tell the same story. Do not invent a second narrative.
- Do not write HTML, CSS, or slide regions. Code paints those from the story and hub.visual data.
- Overflow: rewrite shorter. Never shrink type. Drop secondary content before crowding the layout.
- Keep the same number of use cases and the same JSON shape.

${NO_PROSE}
Return the full corrected object in exactly this shape:
${schema}`;
}

// Pass 7 — verification gate. Every claim gets a confidence and a basis.
export function verifyPrompt({ companyName, domain, requirement, research, draft }) {
  return `${BRIEF_FIRST_RULE}

This content will be shown to ${companyName} leadership. Anything stated as fact must be traceable. Your job is to label, not to embellish.

Research available:
${String(research).slice(0, 2600)}

Content:
${JSON.stringify(draft).slice(0, 9000)}

For EACH use case, identify the 2-3 load-bearing claims it makes about ${companyName} or its operation. For each claim decide:
- "confirmed": supported by the research or genuinely public knowledge. Say what supports it.
- "industry-typical": normal for a ${domain} operator of this size but NOT confirmed for this company. Say that plainly.

Never mark something confirmed to make the deck look stronger. An honest "industry-typical" is what leadership needs.

Also give the package an overall evidence note: one sentence a presenter can say out loud about what is verified and what is assumed.

${NO_PROSE}
{"evidenceNote":"","useCases":[{"title":"","assumptions":[{"claim":"","confidence":"confirmed|industry-typical","basis":""}]}]}

One entry per use case, matched by title. 2-3 assumptions each. claim 8-18 words. basis 8-18 words. evidenceNote 15-30 words.`;
}

// KPI / data model — what the executive needs to see, before any chart.
export function kpiModelPrompt({ companyName, domain, requirement, draft }) {
  const titles = (draft?.useCases || []).map((uc) => uc.title).filter(Boolean);
  return `${BRIEF_FIRST_RULE}

Do NOT write HTML or slide regions. Build the KPI and data model for ${companyName} (${domain}).

Mandate: "${requirement}"

Use cases:
${JSON.stringify((draft?.useCases || []).map((uc) => ({ title: uc.title, challenge: uc.challenge, kpis: uc.kpis, action: uc.action, businessProblem: uc.businessProblem }))).slice(0, 7000)}

For each use case name:
- persona: who decides
- decision: the choice they take from this view
- primaryKpi: the one number they watch
- signals: 2-4 data signals that feed it
- dimensions: how they slice (line, region, shift, product — only if this operation has them)
- exceptionRule: when it turns from watch to act
- insight: one sentence they should notice
- businessImpact: what improves if they act

Numbers in this pass are illustrative patterns, not live client KPIs. Keep them internally consistent.

${NO_PROSE}
{"useCases":[{"title":"${titles[0] || ""}","persona":"","decision":"","primaryKpi":"","signals":[""],"dimensions":[""],"exceptionRule":"","insight":"","businessImpact":""}]}

One entry per use case, matched by title. persona 2-6 words. decision 8-16 words. insight 12-22 words.`;
}

// Storyboard — single source of truth for PPT and HTML. No markup yet.
export function uiPlanPrompt({ companyName, domain, requirement, draft }) {
  const titles = (draft?.useCases || []).map((uc) => uc.title).filter(Boolean);
  return `${BRIEF_FIRST_RULE}

Do NOT write HTML, CSS, or slide regions yet. Produce the PITCH STORYBOARD for ${companyName} (${domain}). PPT and HTML will both render from this JSON. They must not invent a second story.

Mandate: "${requirement}"

Use cases with KPI model (slides in the PPT; KPIs together on the one HTML hub):
${JSON.stringify((draft?.useCases || []).map((uc) => ({ title: uc.title, persona: uc.persona, decision: uc.decision, insight: uc.insight, challenge: uc.challenge, kpis: uc.kpis, action: uc.action, primaryKpi: uc.primaryKpi, signals: uc.signals, exceptionRule: uc.exceptionRule }))).slice(0, 7500)}

Start from the insight, not from a dashboard template.

Visualization vocabulary (choose, combine, modify, or invent — this is not a mandatory library):
- trend → bars or a small spark in a callout
- ranking → bars
- contribution / variance → bars or compare
- bottleneck / risk / exception → heat or matrix
- process / journey → flow, funnel, or timeline
- status / work queue → board or queue
- before/after → compare
- forecast → bars plus a callout for the band
- signature → one memorable visual on the hub when a standard chart would hide the insight

Novelty budget: about 70% familiar, 20% advanced (heat, flow, matrix), 10% signature (the hub). Do not make every slide unique for novelty. A screen looks different when the decision is different.

HTML hub — one screen a ${domain} VP would leave open Monday morning:
- visualConcept: the named experience (command center, journey, exposure map, forecast — derived from THIS operation)
- Who is looking, what decision, what insight
- ONE primary visual and why
- interaction: what they do next (select, compare, act) — business purpose only
- rail: 2-3 next leadership moves, one sentence each
- avoid: deck challenge, Apexon value, solution essay

PPT — one idea per use-case slide. Neighbouring kind sequences must differ. Do not put challenge + steps + KPIs + value on every slide.

${NO_PROSE}
{"executiveMessage":"","visualConcept":"","industryMetaphor":"","noveltyNote":"","hubPlan":{"viewer":"","decision":"","insight":"","visualObjective":"","primaryVisual":"","whyThisVisual":"","interaction":"","rail":["",""],"avoid":[""]},"slides":[{"title":"${titles[0] || ""}","persona":"","decision":"","insight":"","visualObjective":"","visualizationType":"","visualizationReason":"","idea":"","kinds":["quote","steps"],"whyThisComposition":"","interaction":"","businessImpact":""}]}

executiveMessage: 12-22 words, what leadership must remember. visualConcept: 2-5 words. hubPlan.primaryVisual: table, board, heat, compare, flow, funnel, or matrix — plus why. slides: one per use case, matched by title. kinds from quote, list, pair, steps, kpis, callout, split, compare.`;
}

// Render hub visual data FROM the storyboard. Code paints HTML and slides.
export function designPrompt({ companyName, domain, requirement, draft, uiPlan }) {
  const titles = (draft?.useCases || []).map((uc) => uc.title).filter(Boolean);
  const kpiLines = (draft?.useCases || [])
    .map((uc) => `- ${uc.title}: ${(uc.kpis || []).map((k) => k.name).filter(Boolean).join(", ")}`)
    .join("\n");
  return `${BRIEF_FIRST_RULE}

You are a presentation engineer rendering an already-approved storyboard for ${companyName} (${domain}). Do not redesign the business story. Implement the storyboard.

Mandate: "${requirement}"

Storyboard (single source of truth — PPT and HTML must match this, not each other as copies):
${JSON.stringify(uiPlan || {}).slice(0, 4500)}

Use cases (do not change titles):
${JSON.stringify((draft?.useCases || []).map((uc) => ({ title: uc.title, subtitle: uc.subtitle, persona: uc.persona, decision: uc.decision, insight: uc.insight, kpis: uc.kpis, challenge: uc.challenge, solutionMoves: uc.solutionMoves, businessValue: uc.businessValue }))).slice(0, 7000)}

KPIs the HTML must cover (one from each use case):
${kpiLines}

PPT is the executive story. HTML is the working product view. They share terminology, KPIs, and insight. They do NOT share layout. Do not paste the HTML into a slide. Do not paste the slide essay into the HTML.

1. hub — ONE product screen. Do NOT write HTML. Return hub.visual as data. The builder paints the page so labels cannot overlap.
   - hub.title: max 8 words. hub.subtitle: 6-12 words. hub.whatItShows: the hubPlan.insight in 12-22 words.
   - hub.kpis: one per use case. value is SAMPLE only. why: If this number moves the wrong way, what breaks. from: the use-case title.
   - hub.visual.kind: table, heat, board, compare, or flow — match hubPlan.primaryVisual.
   - hub.visual.heading: max 8 words.
   - table: columns (2-4 short headers) and rows (3-5), one fact per cell.
   - heat: cells[{label, state: good|warn|bad, note}] max 6. label under 4 words.
   - board: lanes[{title, body}] max 3.
   - compare: before, after — one sentence each.
   - flow: steps[] max 4 short labels.
   - actions: 2-3 next moves from hubPlan.rail, one sentence each.

2. slide idea only. One sentence the executive remembers. Do not emit regions, HTML, or CSS. Code composes the slide.

${NO_PROSE}
{"hub":{"title":"","subtitle":"","whatItShows":"","kpis":[{"name":"","value":"","why":"","from":"${titles[0] || ""}"}],"visual":{"kind":"table","heading":"","columns":["",""],"rows":[["",""]],"cells":[{"label":"","state":"warn","note":""}],"lanes":[{"title":"","body":""}],"before":"","after":"","steps":[""],"actions":[""]}},"useCases":[{"title":"${titles[0] || ""}","slide":{"idea":""}}]}

One hub. One slide entry per use case, matched by title. slide.idea: 8-16 words.`;
}

export async function runReasoning({
  companyName,
  domain,
  requirement,
  research,
  count,
  draft,
  draftPrompt,
  schema,
  onStep,
}) {
  const trace = {};

  const frame = await tryPass({
    label: "framing the brief",
    prompt: framePrompt({ companyName, domain, requirement, research }),
    onStep,
  });
  trace.frame = frame;

  const diverged = await tryPass({
    label: "brainstorming options",
    prompt: divergePrompt({ companyName, domain, requirement, research, frame }),
    onStep,
  });
  const candidates = Array.isArray(diverged?.candidates) ? diverged.candidates : [];
  trace.candidates = candidates;

  let selection = null;
  if (candidates.length >= 3) {
    selection = await tryPass({
      label: "scoring and selecting",
      prompt: selectPrompt({ companyName, domain, requirement, frame, candidates, count }),
      onStep,
    });
  }
  trace.selection = selection;
  if (selection?.selected) {
    selection.selected = keepSelected(selection.selected);
  }
  const picked = selection?.selected || [];
  const targetCount = count
    ? clampCount(count, 5)
    : clampCount(picked.length, 5);

  // The draft prompt is owned by the caller so the JSON contract stays in one
  // place; we only feed it the reasoning gathered so far.
  const context = [
    frame?.mandateRestated ? `Mandate restated: ${frame.mandateRestated}` : "",
    frame?.leadershipMustBelieve?.length
      ? `Leadership must believe:\n${lines(frame.leadershipMustBelieve)}`
      : "",
    frame?.failureModes?.length ? `Avoid these failure modes:\n${lines(frame.failureModes)}` : "",
    frame?.unknowns?.length
      ? `Known gaps — mark these as industry-typical assumptions, do not state them as fact:\n${lines(frame.unknowns)}`
      : "",
    picked.length
      ? `Use these ${Math.min(targetCount, picked.length)} selected use cases (average under ${SCORE_FLOOR} was cut) and the reason each was chosen:\n${JSON.stringify(picked.slice(0, targetCount)).slice(0, 2600)}`
      : candidates.length
        ? `Shortlist to draw from:\n${JSON.stringify(candidates.slice(0, 12)).slice(0, 2600)}`
        : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  if (onStep) onStep("drafting the pitch");
  let current = draft;
  try {
    const drafted = extractJson(await askAgent(draftPrompt(context, targetCount), { retries: 1 }));
    if (Array.isArray(drafted?.useCases) && drafted.useCases.length >= 3) current = drafted;
  } catch (err) {
    console.warn(`[reason:draft] failed (${err?.message || err}).`);
  }
  if (!current) return { result: null, trace };

  const kpiModel = await tryPass({
    label: "modelling the KPIs and decisions",
    prompt: kpiModelPrompt({ companyName, domain, requirement, draft: current }),
    onStep,
  });
  if (kpiModel) {
    current = applyKpiModel(current, kpiModel);
    trace.kpiModel = kpiModel;
  }

  const uiPlan = await tryPass({
    label: "writing the pitch storyboard",
    prompt: uiPlanPrompt({ companyName, domain, requirement, draft: current }),
    onStep,
  });
  trace.uiPlan = uiPlan;
  if (uiPlan) current = applyStoryboard(current, uiPlan);

  const designed = await tryPass({
    label: "rendering slides and the leadership screen",
    prompt: designPrompt({ companyName, domain, requirement, draft: current, uiPlan }),
    onStep,
  });
  if (designed?.hub && typeof designed.hub === "object") {
    current.hub = {
      ...designed.hub,
      visual: designed.hub.visual || current.hub?.visual,
      visualConcept: designed.hub.visualConcept || current.hub?.visualConcept,
      decision: designed.hub.decision || current.hub?.decision,
    };
    trace.design = { ...(trace.design || {}), hub: true };
  }
  if (Array.isArray(designed?.useCases) && designed.useCases.length) {
    const byTitle = new Map(
      designed.useCases.map((uc) => [String(uc.title || "").toLowerCase().trim(), uc])
    );
    current.useCases = (current.useCases || []).map((uc) => {
      const match =
        byTitle.get(String(uc.title || "").toLowerCase().trim()) ||
        designed.useCases.find((d) =>
          String(d.title || "").toLowerCase().includes(String(uc.title || "").toLowerCase().slice(0, 16))
        );
      if (!match) return uc;
      return {
        ...uc,
        slide: {
          idea: match.slide?.idea || uc.slide?.idea || uc.insight || "",
        },
      };
    });
    trace.design = { ...(trace.design || {}), slides: designed.useCases.length };
  }

  const critique = await tryPass({
    label: "reviewing for weak content",
    prompt: critiquePrompt({ companyName, domain, requirement, frame, draft: current }),
    onStep,
  });
  const extraDesign = designScoreDefects(critique);
  if (critique && extraDesign.length) {
    critique.defects = [...(critique.defects || []), ...extraDesign];
    if (critique.verdict === "pass") critique.verdict = "revise";
  }
  trace.critique = critique;

  if (critique?.defects?.length || critique?.verdict === "reject") {
    const revised = await tryPass({
      label: `fixing ${critique.defects.length} issues`,
      prompt: revisePrompt({ companyName, requirement, draft: current, critique, schema }),
      onStep,
    });
    if (Array.isArray(revised?.useCases) && revised.useCases.length >= 3) {
      current = { ...revised, hub: revised.hub || current.hub, storyboard: revised.storyboard || current.storyboard };
    }
  }

  // The model is a poor judge of its own register, and it cannot be told which
  // product names to avoid without being reminded of them. So this last gate is
  // deterministic: lint the text, and send only the concrete findings back.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const defects = lintUseCases(current.useCases, requirement, current.hub);
    if (!defects.length) break;
    trace.toneDefects = defects.length;
    const repaired = await tryPass({
      label: `tightening tone (${defects.length} to fix)`,
      prompt: revisePrompt({
        companyName,
        requirement,
        draft: current,
        critique: { defects: defects.slice(0, 40) },
        schema,
      }),
      onStep,
    });
    if (!Array.isArray(repaired?.useCases) || repaired.useCases.length < 3) break;
    const after = lintUseCases(repaired.useCases, requirement, repaired.hub || current.hub);
    if (after.length >= defects.length) break;
    current = { ...repaired, hub: repaired.hub || current.hub, storyboard: repaired.storyboard || current.storyboard };
  }

  const verification = await tryPass({
    label: "verifying claims",
    prompt: verifyPrompt({ companyName, domain, requirement, research, draft: current }),
    onStep,
  });
  trace.verification = verification;

  return { result: current, verification, trace };
}
