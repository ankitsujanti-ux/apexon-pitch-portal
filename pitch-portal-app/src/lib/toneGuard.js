// Two things the model cannot be trusted to police in its own prose:
//
// 1. Vendor and product names bleeding in from material it once saw. Naming
//    those products in the prompt to forbid them is self-defeating — it plants
//    them. So the list lives here, in code, and never reaches the model.
// 2. Consultant register. "Leverage a holistic, robust ecosystem" passes every
//    length check and is still unreadable.
//
// Both are checked deterministically, after generation, on the final text.

// Platforms, products, and vendors that may appear ONLY when the brief asks for
// them. This list is never sent to the model.
const VENDOR_NAMES = [
  "Microsoft Fabric",
  "OneLake",
  "Real-Time Intelligence",
  "Data Activator",
  "Eventstream",
  "Azure AI Foundry",
  "Power BI",
  "Purview",
  "Synapse",
  "Databricks",
  "Snowflake",
  "Teradata",
  "Redshift",
  "BigQuery",
  "Harness",
  "Informatica",
  "Talend",
  "dbt",
  "Airflow",
  "Kafka",
  "Tableau",
  "Qlik",
  "Looker",
  "SageMaker",
  "Vertex AI",
  "Bedrock",
  "OpenAI",
  "Copilot",
];

// Consultant register. Each entry is what to write instead, so a repair pass
// has something concrete to do.
const JARGON = [
  [/\bleverag(e|es|ed|ing)\b/gi, "use"],
  [/\butiliz(e|es|ed|ing)\b/gi, "use"],
  [/\bsynerg(y|ies|istic)\b/gi, "name the actual benefit"],
  [/\bholistic(ally)?\b/gi, "say what it actually covers"],
  [/\brobust(ness)?\b/gi, "say what it withstands"],
  [/\bseamless(ly)?\b/gi, "say what no longer breaks"],
  [/\bfrictionless\b/gi, "say what step disappears"],
  [/\bbest[- ]in[- ]class\b/gi, "drop it or give the number"],
  [/\bworld[- ]class\b/gi, "drop it or give the number"],
  [/\bcutting[- ]edge\b/gi, "drop it"],
  [/\bstate[- ]of[- ]the[- ]art\b/gi, "drop it"],
  [/\bnext[- ]gen(eration)?\b/gi, "drop it"],
  [/\bparadigm\b/gi, "say what changes"],
  [/\becosystem\b/gi, "name the systems"],
  [/\bempower(s|ed|ing)?\b/gi, "say who can now do what"],
  [/\boperationaliz(e|es|ed|ing)\b/gi, "put into use"],
  [/\bactionable insights?\b/gi, "say what decision it supports"],
  [/\bdata[- ]driven\b/gi, "drop it"],
  [/\bmission[- ]critical\b/gi, "say what breaks without it"],
  [/\bturnkey\b/gi, "drop it"],
  [/\btransformational|\btransformative\b/gi, "say what changes"],
  [/\bgranular(ity)?\b/gi, "say the level of detail"],
  [/\bnorth star\b/gi, "say the goal"],
  [/\bmove the needle\b/gi, "say the effect"],
  [/\blow[- ]hanging fruit\b/gi, "say which one is easy"],
  [/\bboil the ocean\b/gi, "drop it"],
  [/\btable stakes\b/gi, "drop it"],
  [/\bdeep[- ]dive\b/gi, "look at in detail"],
  [/\btouch[- ]?points?\b/gi, "name the interaction"],
  [/\bideat(e|ion)\b/gi, "come up with ideas"],
  [/\bstreamlin(e|es|ed|ing)\b/gi, "say what gets removed"],
  [/\bunlock(s|ed|ing)? (value|potential)\b/gi, "say the actual gain"],
  [/\bdriv(e|es|ing) value\b/gi, "say the actual gain"],
  [/\bvalue[- ]add(ed)?\b/gi, "say the actual gain"],
  [/\bsingle pane of glass\b/gi, "one screen"],
  [/\bat scale\b/gi, "say the volume"],
  [/\bfuture[- ]proof\b/gi, "drop it"],
  [/\bbleeding[- ]edge\b/gi, "drop it"],
  [/\bhyper[- ]?personaliz/gi, "say what is tailored"],
  [/\bdigital transformation\b/gi, "say what specifically changes"],
];

const MAX_SENTENCE_WORDS = 32;

// The tone contract sent to the model. Deliberately contains no vendor names.
export const TONE_RULE = `TONE — PLAIN ENGLISH, NON-NEGOTIABLE.

Write for a smart executive who does not work in this function. They are busy and they will not re-read a sentence.

- One idea per sentence. Keep sentences under ${MAX_SENTENCE_WORDS} words.
- Use ordinary words. "use", not "leverage" or "utilize". "one screen", not "single pane of glass".
- Say the concrete thing. "The line stops for 40 minutes", not "throughput degradation events occur".
- No filler adjectives: holistic, robust, seamless, best-in-class, world-class, cutting-edge, transformative, turnkey, frictionless, next-generation, mission-critical, data-driven, actionable.
- No stacked nouns. Break "supply chain visibility optimisation platform" into a sentence a person would say out loud.
- Never use a term without explaining it in the same sentence.
- Name a product, platform, or vendor ONLY if the requirement itself names it. If the requirement does not name one, describe the capability in plain words instead. Do not borrow product names from anywhere else.

Read every sentence back before you answer. If it sounds like a consulting brochure, rewrite it as something you would actually say to a colleague.`;

function escapeRe(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A vendor is allowed once the brief asks for it, including a partial mention
// ("Fabric" for "Microsoft Fabric").
function allowedByBrief(name, brief) {
  const haystack = String(brief || "").toLowerCase();
  if (!haystack) return false;
  const full = name.toLowerCase();
  if (haystack.includes(full)) return true;
  return full
    .split(/[\s-]+/)
    .filter((tok) => tok.length > 3 && !["azure", "microsoft", "data", "intelligence"].includes(tok))
    .some((tok) => haystack.includes(tok));
}

export function findVendorLeaks(text, brief) {
  const body = String(text || "");
  const hits = new Set();
  for (const name of VENDOR_NAMES) {
    if (allowedByBrief(name, brief)) continue;
    if (new RegExp(`\\b${escapeRe(name)}\\b`, "i").test(body)) hits.add(name);
  }
  return [...hits];
}

export function findJargon(text) {
  const body = String(text || "");
  const hits = [];
  for (const [pattern, instead] of JARGON) {
    const found = body.match(pattern);
    if (found) hits.push({ word: found[0], instead });
  }
  return hits;
}

export function findLongSentences(text, max = MAX_SENTENCE_WORDS) {
  return String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ sentence: s, words: s.split(/\s+/).length }))
    .filter((s) => s.words > max);
}

// Every human-readable string in a use case, with a field path for reporting.
function textFields(uc) {
  const out = [];
  const push = (field, value) => {
    if (typeof value === "string" && value.trim()) out.push([field, value]);
  };
  push("title", uc.title);
  push("subtitle", uc.subtitle);
  push("challenge", uc.challenge);
  push("businessProblem", uc.businessProblem);
  push("benefit", uc.benefit);
  push("solutionFit", uc.solutionFit);
  push("proofPoint", uc.proofPoint);
  push("whatItShows", uc.whatItShows);
  push("whyItMatters", uc.whyItMatters);
  push("action", uc.action);
  push("difficultyWhy", uc.difficultyWhy);
  push("dataPointer.description", uc.dataPointer?.description);
  (uc.solutionMoves || []).forEach((m, i) => {
    push(`solutionMoves[${i}].lead`, m?.lead);
    push(`solutionMoves[${i}].detail`, m?.detail);
  });
  (uc.worksWith || []).forEach((v, i) => push(`worksWith[${i}]`, v));
  (uc.businessValue || []).forEach((v, i) => push(`businessValue[${i}]`, v));
  (uc.kpis || []).forEach((k, i) => {
    push(`kpis[${i}].name`, k?.name);
    push(`kpis[${i}].why`, k?.why);
  });
  (uc.techComponents || []).forEach((v, i) => push(`techComponents[${i}]`, v));
  return out;
}

// Deterministic gate over the finished package. Returns defects in the same
// shape the revise pass already consumes, so findings can be repaired.
export function lintUseCases(useCases, brief) {
  const defects = [];
  for (const uc of useCases || []) {
    for (const [field, value] of textFields(uc)) {
      for (const name of findVendorLeaks(value, brief)) {
        defects.push({
          useCase: uc.title,
          field,
          kind: "VENDOR",
          problem: `Names "${name}", which this requirement never asked for.`,
          fix: `Remove "${name}" and describe the capability in plain words instead.`,
        });
      }
      for (const { word, instead } of findJargon(value)) {
        defects.push({
          useCase: uc.title,
          field,
          kind: "JARGON",
          problem: `Uses "${word}", which is consultant filler.`,
          fix: `Replace "${word}" — ${instead}.`,
        });
      }
      for (const { words } of findLongSentences(value)) {
        defects.push({
          useCase: uc.title,
          field,
          kind: "LONG",
          problem: `Contains a ${words}-word sentence; an executive will not re-read it.`,
          fix: `Split it into sentences under ${MAX_SENTENCE_WORDS} words each.`,
        });
      }
    }
  }
  return defects;
}

export const TONE_LIMITS = { maxSentenceWords: MAX_SENTENCE_WORDS };
export const VENDOR_WATCHLIST = VENDOR_NAMES;
