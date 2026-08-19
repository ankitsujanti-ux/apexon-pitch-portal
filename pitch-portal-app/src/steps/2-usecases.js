import { allowLocalFallback, askAgentOrFallback } from "../lib/azureAgentClient.js";
import { extractJson } from "../lib/parseJson.js";
import { fallbackUseCases } from "../lib/fallbacks.js";

function normalizeUseCase(uc, i, fallbackUc) {
  const kpis = Array.isArray(uc.kpis)
    ? uc.kpis
        .filter((k) => k?.name)
        .slice(0, 4)
        .map((k) => ({
          name: String(k.name),
          why: String(k.why || "A leadership metric for this use case."),
        }))
    : fallbackUc?.kpis || [];
  const difficulty = ["easier", "moderate", "harder"].includes(uc.difficulty)
    ? uc.difficulty
    : fallbackUc?.difficulty || "moderate";
  return {
    title: uc.title || fallbackUc?.title || `Use case ${i + 1}`,
    businessProblem: uc.businessProblem || fallbackUc?.businessProblem || "",
    benefit: uc.benefit || uc.solutionFit || fallbackUc?.benefit || "",
    solutionFit: uc.solutionFit || fallbackUc?.solutionFit || "",
    kpis,
    dataPointer: uc.dataPointer || fallbackUc?.dataPointer || { description: "", availability: "existing" },
    difficulty,
    difficultyWhy: uc.difficultyWhy || fallbackUc?.difficultyWhy || "",
    techComponents: Array.isArray(uc.techComponents)
      ? uc.techComponents
      : fallbackUc?.techComponents || ["Microsoft Fabric", "Real-Time Intelligence", "Azure AI Foundry"],
    demoScore: uc.demoScore || 8 - i,
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
    `You are briefing ${companyName} leadership (${domain}).

Verified research (treat industry-typical items as unconfirmed):
${String(research).slice(0, 3200)}

Mandate: "${requirement}"

Brainstorm more than ${numUseCases} ideas internally, then keep the ${numUseCases} strongest that are:
1) tied to how ${companyName} actually makes money or runs operations, and
2) normal and valuable in ${domain}.
Reject anything that could be pasted onto another industry unchanged.

Return ONLY JSON:
{"useCases":[{"title":"","businessProblem":"","benefit":"","solutionFit":"","kpis":[{"name":"","why":""}],"dataPointer":{"description":"","availability":"existing|new","confidence":"confirmed|industry-typical"},"difficulty":"easier|moderate|harder","difficultyWhy":"","techComponents":["Microsoft Fabric"],"demoScore":9}],"overallBenefits":["","",""]}

Rules:
- Plain executive English. A business user should understand every sentence. No unexplained jargon.
- Each use case: what it is, how the company benefits, 3-4 KPIs with a one-line why, data required, and how easy or hard based on the research (confirmed systems = easier; new or unconfirmed data = harder).
- difficultyWhy must cite the systems/reporting from research. Do not invent a stack they did not mention.
- KPIs are the measures leadership would watch. Do not invent current company numbers.
- overallBenefits: 4-6 company-level outcomes of doing all five together.
- Produce exactly ${numUseCases} use cases.`,
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
            ? parsed.overallBenefits.map(String).filter(Boolean).slice(0, 6)
            : fallback.overallBenefits,
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
