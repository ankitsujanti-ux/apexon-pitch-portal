import { allowLocalFallback, askAgentOrFallback } from "../lib/azureAgentClient.js";
import { extractJson } from "../lib/parseJson.js";
import { fallbackUseCases } from "../lib/fallbacks.js";
import { BRIEF_FIRST_RULE, defaultTechStack, normalizeArchitecture } from "../lib/briefFirst.js";

function clip(text, maxChars) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars).replace(/\s+\S*$/, "");
}

function normalizeUseCase(uc, i, fallbackUc, requirement = "", domain = "") {
  const kpis = Array.isArray(uc.kpis)
    ? uc.kpis
        .filter((k) => k?.name)
        .slice(0, 4)
        .map((k) => ({
          name: clip(k.name, 28),
          why: clip(k.why || "A leadership metric for this use case.", 72),
        }))
    : fallbackUc?.kpis || [];
  const difficulty = ["easier", "moderate", "harder"].includes(uc.difficulty)
    ? uc.difficulty
    : fallbackUc?.difficulty || "moderate";
  return {
    title: clip(uc.title || fallbackUc?.title || `Use case ${i + 1}`, 52),
    businessProblem: clip(uc.businessProblem || fallbackUc?.businessProblem || "", 160),
    benefit: clip(uc.benefit || uc.solutionFit || fallbackUc?.benefit || "", 160),
    solutionFit: clip(uc.solutionFit || fallbackUc?.solutionFit || "", 120),
    kpis,
    dataPointer: {
      description: clip(
        (typeof uc.dataPointer === "string" ? uc.dataPointer : uc.dataPointer?.description) ||
          fallbackUc?.dataPointer?.description ||
          "",
        90
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
    difficultyWhy: clip(uc.difficultyWhy || fallbackUc?.difficultyWhy || "", 90),
    techComponents: Array.isArray(uc.techComponents)
      ? uc.techComponents.slice(0, 3)
      : fallbackUc?.techComponents || defaultTechStack(requirement, domain),
    demoScore: uc.demoScore || 8 - i,
    tabWhy: clip(uc.tabWhy || `${uc.businessProblem || fallbackUc?.businessProblem || ""} ${uc.benefit || fallbackUc?.benefit || ""}`.trim(), 220),
    lookFirst: clip(uc.lookFirst || uc.title || "", 48),
    blocks: Array.isArray(uc.blocks) ? uc.blocks : uc.tabLayout ? [uc.tabLayout] : [],
    columns: Array.isArray(uc.columns) ? uc.columns.map((c) => clip(c, 18)).slice(0, 4) : [],
    zones: Array.isArray(uc.zones) ? uc.zones.map((z) => clip(z, 18)).slice(0, 6) : [],
    recordKind: clip(uc.recordKind || "", 24),
  };
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

You are the pre-sales lead AND the demo designer for THIS brief only. Internally brainstorm at least two approaches, then keep the one that fits the mandate. There is no five-screen template and no leftover architecture from another deck.

Walk ${companyName}. Keep the ${numUseCases} strongest use cases that a ${domain} operator would recognize as THEIR job, addressable by the mandate, without inventing systems.

Then design each HTML tab from scratch. Each tab is a different job — not the same chart with a new title. Compose the tab from 1-3 pieces, in the order they should appear. You name the labels in their language.

Pieces you may combine (renderer primitives, not finished screens):
- kpis: four numbers they would watch
- bars: a status mix (you say what the mix is in lookFirst)
- alerts: exceptions that need a person
- table: rows that need a decision (you name columns)
- heat: a map of THEIR areas (you name zones)
- record: one object they work (you name recordKind)
- actions: recommended next steps
- flow: how work moves for this use case

Also design architecture for THIS mandate: sources they actually run, 2-3 stages named for their process, target platform named in the requirement, optional governance cards only if this brief is about governance. Do not paste Discover / Plan / Generate or L1-L4 unless this requirement is that Harness migration path.

Do not give every tab the same pieces. Write tabWhy as 2 business sentences.

Return ONLY JSON:
{"deckKicker":"","deckTitle":"","deckSubtitle":"","closeLine":"","architecture":{"title":"","subtitle":"","sources":[{"name":""}],"stages":[{"title":"","steps":[""]}],"target":{"name":"","components":[""]},"guards":[{"n":"","title":"","body":""}]},"useCases":[{"title":"","businessProblem":"","benefit":"","solutionFit":"","tabWhy":"","lookFirst":"","blocks":["kpis"],"columns":[],"zones":[],"recordKind":"","kpis":[{"name":"","why":""}],"dataPointer":{"description":"","availability":"existing|new","confidence":"confirmed|industry-typical"},"difficulty":"easier|moderate|harder","difficultyWhy":"","techComponents":[],"demoScore":9}],"overallBenefits":["","",""]}

Length limits (hard):
- deckKicker: max 4 words. From this company or mandate.
- deckTitle: max 8 words. THEIR operating problem, not a generic modernization title.
- deckSubtitle: max 16 words. From THIS mandate.
- closeLine: max 16 words. Thank-you slide.
- architecture.stages: 2-3 titles, each 2-6 short steps.
- architecture.target.name: the platform this requirement asked for.
- title: max 8 words.
- businessProblem: max 28 words.
- benefit: max 22 words.
- tabWhy: exactly 2 short business sentences. Max 36 words.
- lookFirst: max 8 words.
- blocks: 1-3 piece names from the list above.
- columns: 3-4 headers if table is used, named for this process.
- zones: up to 6 area names if heat is used, named for this operation.
- recordKind: one word or short phrase if record is used.
- kpis: exactly 4. name max 4 words. why max 10 words. No invented current numbers.
- dataPointer.description: max 16 words.
- difficultyWhy: max 16 words.
- overallBenefits: exactly 4 lines, each max 18 words.
- techComponents: max 3 names from this mandate.

Produce exactly ${numUseCases} use cases. Design the pitch-deck title, architecture, and close from THIS brief. Use-case titles become the agenda.`,
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
