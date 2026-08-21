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

You are an Apexon pre-sales lead. Before proposing anything, interrogate the brief.

Company: ${companyName}
Industry: ${domain}
Mandate: "${requirement}"

Research:
${String(research).slice(0, 3000)}

Do not propose solutions yet. Answer only these questions:
1. What is this mandate actually asking for, restated in business terms?
2. What must ${companyName} leadership believe by the end of the meeting for this to be a win?
3. What do we genuinely NOT know about this company that matters here? Be honest — list the gaps.
4. What criteria should we use to judge whether a use case is worth putting on a slide for THIS mandate?
5. What would make this pitch fail or feel generic?

${NO_PROSE}
{"mandateRestated":"","leadershipMustBelieve":["",""],"unknowns":["",""],"criteria":["",""],"failureModes":["",""]}

mandateRestated: 25-40 words. leadershipMustBelieve: 2-4 items, 10-20 words each. unknowns: 3-5 honest gaps. criteria: 4-5 judging criteria specific to this mandate. failureModes: 2-3 ways this pitch goes wrong.`;
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

Generate 9 CANDIDATE use cases. Do not filter yet and do not polish the wording. Cast wide: include obvious operational ones, one or two that a competitor would miss, and one that is uncomfortable but valuable.

For each candidate say who inside the company feels the pain, what job it is, and what data it would lean on.

${NO_PROSE}
{"candidates":[{"title":"","job":"","whoFeelsIt":"","whyItFitsMandate":"","dataNeeded":"","weakness":""}]}

Exactly 9 candidates. title max 9 words. job 15-25 words. whoFeelsIt: the actual role. whyItFitsMandate 12-20 words. dataNeeded 8-16 words. weakness: the honest reason this might not make the cut, 8-16 words.`;
}

// Pass 3 — score against the stated criteria and justify the cut.
export function selectPrompt({ companyName, domain, requirement, frame, candidates, count }) {
  return `${BRIEF_FIRST_RULE}

Score these candidate use cases for ${companyName} (${domain}) against the mandate "${requirement}".

Candidates:
${JSON.stringify(candidates).slice(0, 4000)}

Criteria for this brief:
${lines(frame?.criteria)}

Score each 1-10 on: recognisable (an operator says "that is my job"), mandateFit, demoable (can be shown without inventing systems), dataLikely (the data plausibly exists).

Then choose the ${count} strongest. Prefer a spread of different jobs over ${count} variations of one idea. Say plainly why each winner won and why each rejected one lost.

${NO_PROSE}
{"selected":[{"title":"","scores":{"recognisable":9,"mandateFit":9,"demoable":8,"dataLikely":7},"whyChosen":""}],"rejected":[{"title":"","whyNot":""}]}

Exactly ${count} in selected. whyChosen 15-25 words. Every non-selected candidate appears in rejected with whyNot, 10-20 words.`;
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
- GENERIC: a sentence that would read identically for any other company in any other industry.
- UNSUPPORTED: a claim about ${companyName} that the research does not support and that is not flagged as an assumption.
- INVENTED: a specific number, system name, vendor, or metric that was made up.
- SO_WHAT: a screen or KPI where a business reader would ask "why do I care".
- REPEAT: two use cases that are really the same job, or the same visual reused.

Name the exact use case and field for each defect, and say what would fix it.

${NO_PROSE}
{"verdict":"pass|revise","defects":[{"useCase":"","field":"","kind":"LABEL|GENERIC|UNSUPPORTED|INVENTED|SO_WHAT|REPEAT","problem":"","fix":""}]}

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

Rules while revising:
- Replace any label fragment with a full explanatory sentence a layman can follow.
- Replace generic sentences with something only true of ${companyName} and this mandate.
- Remove invented numbers, vendors, and system names. If a claim cannot be supported, either cut it or word it as an industry-typical assumption.
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
  if (candidates.length >= count) {
    selection = await tryPass({
      label: "scoring and selecting",
      prompt: selectPrompt({ companyName, domain, requirement, frame, candidates, count }),
      onStep,
    });
  }
  trace.selection = selection;

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
      ? `Use these selected use cases and the reason each was chosen:\n${JSON.stringify(selection.selected).slice(0, 2600)}`
      : candidates.length
        ? `Shortlist to draw from:\n${JSON.stringify(candidates.slice(0, 9)).slice(0, 2600)}`
        : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  if (onStep) onStep("drafting the pitch");
  let current = draft;
  try {
    const drafted = extractJson(await askAgent(draftPrompt(context), { retries: 1 }));
    if (Array.isArray(drafted?.useCases) && drafted.useCases.length >= 3) current = drafted;
  } catch (err) {
    console.warn(`[reason:draft] failed (${err?.message || err}).`);
  }
  if (!current) return { result: null, trace };

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
    if (Array.isArray(revised?.useCases) && revised.useCases.length >= 3) current = revised;
  }

  const verification = await tryPass({
    label: "verifying claims",
    prompt: verifyPrompt({ companyName, domain, requirement, research, draft: current }),
    onStep,
  });
  trace.verification = verification;

  return { result: current, verification, trace };
}
