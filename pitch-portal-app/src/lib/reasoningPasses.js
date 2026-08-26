// Multi-pass reasoning for the pitch package.
//
// A single generation call cannot deliberate: the model emits its first answer
// and the builder paints it. Instructing it to "think harder" changes nothing
// because nothing inspects whether it did. These passes make the deliberation
// actually run — the brief is framed, options diverge, they are scored, drafted,
// attacked by a hostile reviewer, revised against those specific defects, and
// finally every factual claim is labelled with its basis.
//
// Every pass degrades gracefully: if a pass cannot be parsed we keep the state
// from the previous pass rather than failing the whole generation.

import { askAgent } from "./azureAgentClient.js";
import { extractJson } from "./parseJson.js";
import { BRIEF_FIRST_RULE } from "./briefFirst.js";
import { TONE_RULE, lintUseCases } from "./toneGuard.js";
import { clampCount, classCatalog } from "./designContract.js";

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

Score each 1-10 on: clientRelevance, industryRelevance, businessValue, executiveRelevance, dataLikely, demoable, differentiation, storytellingPotential. Do not pick a use case only because it is easy to draw.

Then choose how many this brief actually needs. At least 3, at most 7. A tight mandate is 3. A sprawling operation is 6 or 7. Prefer fewer that a leader would remember over padding. If you were asked for a specific count, honour it: ${count ? `choose exactly ${count}.` : "choose the count yourself."}

Reject generic capabilities even if they scored well on demoable.

${NO_PROSE}
{"selected":[{"title":"","scores":{"clientRelevance":9,"industryRelevance":9,"businessValue":9,"executiveRelevance":8,"dataLikely":7,"demoable":8,"differentiation":8,"storytellingPotential":8},"whyChosen":""}],"rejected":[{"title":"","whyNot":""}]}

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

Also fail the draft if a CXO would not find it commercially meaningful, or if it could be reused for another company unchanged.

Name the exact use case and field for each defect, and say what would fix it.

${NO_PROSE}
{"verdict":"pass|revise","defects":[{"useCase":"","field":"","kind":"LABEL|GENERIC|UNSUPPORTED|INVENTED|SO_WHAT|REPEAT|JARGON|SAMEY|SPARSE|HUB|TECH_FIRST|DASHBOARD","problem":"","fix":""}]}

Report every real defect, up to 14. If the draft is genuinely strong, verdict "pass" with an empty defects array. problem and fix: 10-22 words each.`;
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
- Give every use case a slide composition (slide.regions) that is different from its neighbours.
- Design one hub HTML screen covering the KPIs from those use cases — not a tab per job, and not the deck restated.
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

// Pass between draft and critique — the agent designs each screen and slide.
export function designPrompt({ companyName, domain, requirement, draft }) {
  const titles = (draft?.useCases || []).map((uc) => uc.title).filter(Boolean);
  const kpiLines = (draft?.useCases || [])
    .map((uc) => `- ${uc.title}: ${(uc.kpis || []).map((k) => k.name).filter(Boolean).join(", ")}`)
    .join("\n");
  return `${BRIEF_FIRST_RULE}

You are designing the PowerPoint slides and ONE leadership HTML screen for ${companyName} (${domain}). This will be shown to company leadership. Tone, wording, and UI must be boardroom-level: easy to follow, using the words this industry actually uses.

Mandate: "${requirement}"

Use cases already written (do not change titles or rewrite their story). These become the PPT slides:
${JSON.stringify((draft?.useCases || []).map((uc) => ({ title: uc.title, subtitle: uc.subtitle, whatItShows: uc.whatItShows, kpis: uc.kpis, challenge: uc.challenge, solutionMoves: uc.solutionMoves, businessValue: uc.businessValue }))).slice(0, 8000)}

KPIs the HTML must cover (one from each use case, as leadership would see them together):
${kpiLines}

Invent the design at runtime for THIS company. Do not reuse a prior layout, tab tour, or generic dashboard. A VP of this function should recognise Monday morning in one glance.

Do not start by picking a chart. Start from the business insight, then choose the visual that makes that insight obvious. Every number on screen must have meaning, why it matters, what to notice, and what to do. High density, not random charts.

1. hub — ONE product screen a leader would leave open. Not a tab per use case. Not the deck. Leave useCases[].screenHtml empty.
   - hub.title: max 8 words, in their language.
   - hub.subtitle: 6-12 words.
   - hub.whatItShows: one sentence, 12-22 words.
   - hub.kpis: one entry per use case. name from that job. value is SAMPLE only. why: one sentence. from: the use-case title.
   - hub.screenHtml: the working view UNDER the KPI strip. Use only these tags: article, section, div, h3, h4, p, span, b, small, ul, ol, li, table, thead, tbody, tr, th, td, button.
   Allowed CSS classes:
${classCatalog()}
   Style attribute is allowed only as width:N% on a fill or funnel step. No scripts. No images.
   HARD LAYOUT: <div class="row"> with EXACTLY two children.
   - Child 1: <article class="viz"> the work (one board OR one table OR one heat — not all three).
   - Child 2: <article class="side"> the next move (queue, compare, or actions).
   Do not put a kpi strip inside the row. The builder paints KPIs above this markup.

2. slide — for EACH use case, the PowerPoint composition. One idea, named in slide.idea. Then 1-4 regions on a 12-column grid.
   kind is one of: quote, list, pair, steps, kpis, callout, split, compare.
   span is 4, 6, or 12. Neighbouring slides must not share the same kind sequence.

Do not restate the challenge in hub.screenHtml.

${NO_PROSE}
{"hub":{"title":"","subtitle":"","whatItShows":"","screenHtml":"","kpis":[{"name":"","value":"","why":"","from":"${titles[0] || ""}"}]},"useCases":[{"title":"${titles[0] || ""}","slide":{"idea":"","regions":[{"kind":"quote","span":12,"kicker":"","title":"","body":"","items":[],"accent":""}]}}]}

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
  const targetCount = count
    ? clampCount(count, 5)
    : clampCount(selection?.selected?.length, 5);

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
    selection?.selected?.length
      ? `Use these ${Math.min(targetCount, selection.selected.length)} selected use cases and the reason each was chosen:\n${JSON.stringify(selection.selected.slice(0, targetCount)).slice(0, 2600)}`
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

  const designed = await tryPass({
    label: "designing the leadership screen",
    prompt: designPrompt({ companyName, domain, requirement, draft: current }),
    onStep,
  });
  if (designed?.hub && typeof designed.hub === "object") {
    current.hub = designed.hub;
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
        screenHtml: match.screenHtml || uc.screenHtml,
        slide: match.slide || uc.slide,
      };
    });
    trace.design = { ...(trace.design || {}), slides: designed.useCases.length };
  }

  const critique = await tryPass({
    label: "reviewing for weak content",
    prompt: critiquePrompt({ companyName, domain, requirement, frame, draft: current }),
    onStep,
  });
  trace.critique = critique;

  if (critique?.defects?.length) {
    const revised = await tryPass({
      label: `fixing ${critique.defects.length} issues`,
      prompt: revisePrompt({ companyName, requirement, draft: current, critique, schema }),
      onStep,
    });
    if (Array.isArray(revised?.useCases) && revised.useCases.length >= 3) {
      current = { ...revised, hub: revised.hub || current.hub };
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
    current = { ...repaired, hub: repaired.hub || current.hub };
  }

  const verification = await tryPass({
    label: "verifying claims",
    prompt: verifyPrompt({ companyName, domain, requirement, research, draft: current }),
    onStep,
  });
  trace.verification = verification;

  return { result: current, verification, trace };
}
