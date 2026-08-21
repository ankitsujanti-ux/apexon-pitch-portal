import { allowLocalFallback, askAgentOrFallback } from "../lib/azureAgentClient.js";
import { extractJson } from "../lib/parseJson.js";
import { fallbackUseCases } from "../lib/fallbacks.js";
import { BRIEF_FIRST_RULE, defaultTechStack, normalizeArchitecture } from "../lib/briefFirst.js";

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
  numUseCases = 5,
  numMockupTabs = 5,
}) {
  if (!companyName || !domain || !requirement || !research) {
    throw new Error(
      "generateUseCases requires companyName, domain, requirement, and research"
    );
  }

  const fallback = fallbackUseCases({
    companyName,
    domain,
    requirement,
    numUseCases,
    numMockupTabs,
  });

  const { value: raw, source } = await askAgentOrFallback(
    `${BRIEF_FIRST_RULE}

You are an Apexon pre-sales lead preparing a 20-minute boardroom pitch for ${companyName} (${domain}).

Verified research (treat industry-typical items as unconfirmed):
${String(research).slice(0, 3200)}

Mandate: "${requirement}"

You are the pre-sales lead AND the demo designer for THIS brief only. Internally brainstorm at least two approaches, then keep the one that fits the mandate.

Walk ${companyName}. Keep the ${numUseCases} strongest use cases that a ${domain} operator would recognize as THEIR job, addressable by the mandate, without inventing systems.

WRITE IN FULL SENTENCES. This is the most important instruction. Label fragments like "Payment success", "Ask clarifier", or "Less time to pay" are a FAILED answer — a reader who knows nothing about this project must understand the use case from your text alone. Explain, do not label.

For EVERY use case, explain the whole story the way a solution architect would on a slide:
- challenge: 2-3 sentences on what goes wrong today, in their operation, with the consequence. Name the systems, roles, and moment it happens.
- solutionMoves: 3 named moves. Each has a short lead ("See it live", "Act instantly", "Work with what you run") and a full-sentence detail explaining what the capability actually does for them.
- worksWith: 2-3 sentences on how this sits alongside the systems they already run, so nothing is ripped out.
- businessValue: 3 sentences on the business outcome — money, risk, time, or experience. Not adjectives.
- dataPointer.description: a sentence naming the data this needs and where it usually lives.
- kpis: exactly 4. Each name is the metric; each why is a full sentence saying what the metric tells leadership and why it moves with this change.
- proofPoint: one sentence of industry evidence or a comparable pattern, only if you are confident. Otherwise "".

Then design each HTML screen for that job. Do not reuse one chart with a new title.
- whatItShows: 1-2 sentences describing what is on this screen.
- whyItMatters: 1-2 sentences on the business stake.
- action: 1-2 sentences on what the user does with it.

Compose the visual from 1-3 primitives, named in THEIR language. Different mix per tab. Add entities (plants, lots, stores, claims — THEIR objects) and steps (a 3-4 step path) when that screen needs them.

Primitives (the HTML builder can only paint these — choose which, do not invent other chart types):
- kpis, bars, alerts, table, heat, record, actions, flow, compare (before/after), timeline (their process steps), entities (tiles for their objects)

Do not put Fabric, Harness, or OneLake in techComponents, flow, or labels unless the mandate names them.

Also design architecture for THIS mandate: sources they run, 2-3 stages named for their process, target = platform named in the requirement (or "Target platform" if none), guards only if this brief is about governance.

Return ONLY JSON:
{"deckKicker":"","deckTitle":"","deckSubtitle":"","closeLine":"","architecture":{"title":"","subtitle":"","sources":[{"name":""}],"stages":[{"title":"","steps":[""]}],"target":{"name":"","components":[""]},"guards":[{"n":"","title":"","body":""}]},"useCases":[{"title":"","subtitle":"","challenge":"","businessProblem":"","benefit":"","solutionFit":"","solutionMoves":[{"lead":"","detail":""}],"worksWith":[""],"businessValue":[""],"proofPoint":"","whatItShows":"","whyItMatters":"","action":"","lookFirst":"","blocks":["table"],"columns":[],"zones":[],"entities":[],"steps":[],"recordKind":"","kpis":[{"name":"","why":""}],"dataPointer":{"description":"","availability":"existing|new","confidence":"confirmed|industry-typical"},"difficulty":"easier|moderate|harder","difficultyWhy":"","techComponents":[],"demoScore":9}],"overallBenefits":["","",""]}

Length guidance — these are MINIMUMS for the explanatory fields, so write enough to be understood:
- challenge: 35-55 words. At least 2 sentences.
- solutionMoves: exactly 3. lead 2-4 words. detail 18-30 words, a complete sentence.
- worksWith: 2-3 items, 10-18 words each, full sentences.
- businessValue: 3 items, 10-18 words each, full sentences.
- kpis: exactly 4. name 2-4 words. why 12-20 words, a full sentence. No invented current numbers.
- dataPointer.description: 12-25 words.
- difficultyWhy: 12-25 words.
- whatItShows / whyItMatters / action: 15-30 words each.
- businessProblem: 25-40 words. benefit: 20-35 words.
- title: max 9 words. subtitle: 6-12 words, the promise of this use case.
- deckKicker: max 4 words. deckTitle: max 9 words. deckSubtitle: max 18 words. closeLine: max 18 words.
- architecture.stages: 2-3 titles, each 2-6 short steps.
- architecture.target.name: only a platform named in the mandate, else "Operating platform".
- lookFirst: max 8 words. blocks: 1-3 primitive names, unique mix per tab.
- columns / zones / entities / steps: named for THIS process when used.
- overallBenefits: exactly 4 lines, 12-20 words each.
- techComponents: max 3 names from this mandate only.

Produce exactly ${numUseCases} use cases. Design title, architecture, screens, and close from THIS brief. Use-case titles become the agenda.`,
    () => null,
    "usecases"
  );

  if (raw) {
    try {
      const parsed = extractJson(raw);
      const list = Array.isArray(parsed.useCases)
        ? parsed.useCases
        : Array.isArray(parsed)
          ? parsed
          : [];
      const useCases = list
        .filter((uc) => uc?.title && uc?.businessProblem)
        .slice(0, numUseCases)
        .map((uc, i) => normalizeUseCase(uc, i, fallback.useCases[i], requirement, domain));
      if (useCases.length >= 3) {
        return {
          useCases,
          topForMockup: useCases.slice(0, numMockupTabs).map((uc) => uc.title),
          overallBenefits: Array.isArray(parsed.overallBenefits)
            ? parsed.overallBenefits.map((s) => clip(String(s), 110)).filter(Boolean).slice(0, 4)
            : fallback.overallBenefits,
          ...normalizeDeckCopy(parsed, fallback, companyName, domain, requirement),
          architecture: normalizeArchitecture(parsed.architecture, {
            companyName,
            domain,
            requirement,
            researchStructured: typeof research === "object" ? research : null,
            useCases,
          }),
          source,
        };
      }
    } catch (err) {
      console.warn("generateUseCases: could not parse agent JSON.", err.message);
    }
  }

  if (!allowLocalFallback()) {
    throw new Error(
      "Azure AI Foundry did not return usable company-specific use cases. Submit the brief again."
    );
  }

  return { ...fallback, source: "fallback" };
}

export function selectTopUseCases(useCasesResult) {
  const { useCases, topForMockup } = useCasesResult;
  const picked = (topForMockup || [])
    .map((title) => useCases.find((uc) => uc.title === title))
    .filter(Boolean);
  if (picked.length) return picked;
  return (useCases || []).slice(0, 5);
}
