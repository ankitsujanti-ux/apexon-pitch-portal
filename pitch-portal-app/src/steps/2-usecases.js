import { allowLocalFallback, askAgentOrFallback } from "../lib/azureAgentClient.js";
import { extractJson } from "../lib/parseJson.js";
import { fallbackUseCases } from "../lib/fallbacks.js";

function clip(text, maxChars) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars).replace(/\s+\S*$/, "");
}

function normalizeUseCase(uc, i, fallbackUc) {
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
      : fallbackUc?.techComponents || ["Microsoft Fabric", "Real-Time Intelligence", "Azure AI Foundry"],
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
    deckKicker: clip(parsed.deckKicker || fallback.deckKicker || "Apexon Harness", 28),
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
    `You are an Apexon pre-sales lead preparing a 20-minute boardroom pitch for ${companyName} (${domain}).

Verified research (treat industry-typical items as unconfirmed):
${String(research).slice(0, 3200)}

Mandate: "${requirement}"

You are the pre-sales lead AND the demo designer for this one brief. Think first. There is no five-screen template.

Walk ${companyName}. Keep the ${numUseCases} strongest use cases that a ${domain} operator would recognize as THEIR job, addressable by the mandate, without inventing systems.

Then design each tab from scratch. Hornets is the quality bar (Overview, Fan 360, Ticketing, and Smart Venue are different jobs — not the same chart with a new title). Decide what THIS person would look at. Compose the tab from 1-3 pieces, in the order they should appear. You name the pieces in their language.

Pieces you may combine (not a menu of finished screens — you choose which, and you name the labels):
- kpis: four numbers they would watch
- bars: a status mix (you say what the mix is in lookFirst)
- alerts: exceptions that need a person
- table: rows that need a decision (you name columns)
- heat: a map of THEIR areas (you name zones: lines, stands, desks, stores — whatever this business uses)
- record: one lot / fan / claim / order (you name recordKind)
- actions: recommended next steps
- flow: how work moves for this use case

Do not give every tab the same pieces. Write tabWhy as 2 business sentences.

Return ONLY JSON:
{"deckKicker":"","deckTitle":"","deckSubtitle":"","closeLine":"","useCases":[{"title":"","businessProblem":"","benefit":"","solutionFit":"","tabWhy":"","lookFirst":"","blocks":["kpis"],"columns":[],"zones":[],"recordKind":"","kpis":[{"name":"","why":""}],"dataPointer":{"description":"","availability":"existing|new","confidence":"confirmed|industry-typical"},"difficulty":"easier|moderate|harder","difficultyWhy":"","techComponents":["Microsoft Fabric"],"demoScore":9}],"overallBenefits":["","",""]}

Length limits (hard):
- deckKicker: max 4 words. Title-slide first line (e.g. company or "Harness-Governed").
- deckTitle: max 8 words. The title slide — THEIR operating problem, not a generic "Data Modernization Solution".
- deckSubtitle: max 16 words. One line under the title, from THIS mandate.
- closeLine: max 16 words. Thank-you slide. What we ask them to do next.
- title: max 8 words.
- businessProblem: max 28 words.
- benefit: max 22 words.
- tabWhy: exactly 2 short business sentences. Max 36 words.
- lookFirst: max 8 words. The heading on the main panel, in their words.
- blocks: 1-3 piece names from the list above.
- columns: 3-4 headers if table is used, named for this process.
- zones: up to 6 area names if heat is used, named for this operation.
- recordKind: one word or short phrase if record is used (Lot, Fan, Claim, Order).
- kpis: exactly 4. name max 4 words. why max 10 words. No invented current numbers.
- dataPointer.description: max 16 words.
- difficultyWhy: max 16 words.
- overallBenefits: exactly 4 lines, each max 18 words.
- techComponents: max 3 names.

Produce exactly ${numUseCases} use cases. Also design the pitch-deck title, subtitle, and close from THIS brief. The agenda is built from your use-case titles — make those titles room-ready.`,
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
        .map((uc, i) => normalizeUseCase(uc, i, fallback.useCases[i]));
      if (useCases.length >= 3) {
        return {
          useCases,
          topForMockup: useCases.slice(0, numMockupTabs).map((uc) => uc.title),
          overallBenefits: Array.isArray(parsed.overallBenefits)
            ? parsed.overallBenefits.map((s) => clip(String(s), 110)).filter(Boolean).slice(0, 4)
            : fallback.overallBenefits,
          ...normalizeDeckCopy(parsed, fallback, companyName, domain, requirement),
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
