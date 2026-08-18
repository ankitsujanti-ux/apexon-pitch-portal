import { allowLocalFallback, askAgentOrFallback } from "../lib/azureAgentClient.js";
import { extractJson } from "../lib/parseJson.js";
import { fallbackUseCases } from "../lib/fallbacks.js";

export async function generateUseCases({
  companyName,
  domain,
  requirement,
  research,
  numUseCases = 5,
  numMockupTabs = 3,
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
    `Based on this research about ${companyName} (${domain}):

${String(research).slice(0, 1800)}

Requirement: "${requirement}"

Return ONLY JSON, no markdown, no commentary:
{"useCases":[{"title":"","businessProblem":"","solutionFit":"","dataPointer":{"description":"","availability":"existing"},"techComponents":["Microsoft Fabric","Real-Time Intelligence","Azure AI Foundry"],"demoScore":9}]}

Rules:
- Produce ${numUseCases} use cases that are specific to how ${companyName} actually operates in ${domain}.
- Reject anything generic enough to paste into another industry unchanged.
- Write in plain language a business stakeholder can follow.
- demoScore is 1-10, higher = better live demo.
- dataPointer.availability must be "existing" or "new".`,
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
        .map((uc, i) => ({
          title: uc.title,
          businessProblem: uc.businessProblem,
          solutionFit: uc.solutionFit || fallback.useCases[i]?.solutionFit,
          dataPointer: uc.dataPointer || fallback.useCases[i]?.dataPointer,
          techComponents: uc.techComponents || fallback.useCases[i]?.techComponents,
          demoScore: uc.demoScore || 8 - i,
        }));
      if (useCases.length >= 3) {
        const ranked = [...useCases].sort((a, b) => (b.demoScore || 0) - (a.demoScore || 0));
        return {
          useCases,
          topForMockup: ranked.slice(0, numMockupTabs).map((uc) => uc.title),
          source,
        };
      }
    } catch (err) {
      console.warn("generateUseCases: could not parse agent JSON.", err.message);
    }
  }

  if (!allowLocalFallback()) {
    throw new Error(
      "Azure AI Foundry did not return usable company-specific use cases. Click Generate again."
    );
  }

  return { ...fallback, source: "fallback" };
}

export function selectTopUseCases(useCasesResult) {
  const { useCases, topForMockup } = useCasesResult;
  return topForMockup
    .map((title) => useCases.find((uc) => uc.title === title))
    .filter(Boolean);
}
