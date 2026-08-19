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
    tabLayout: ["live", "profile", "heat", "table", "flow"].includes(uc.tabLayout) ? uc.tabLayout : "",
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

You are also the demo product designer. For this specific brief, think — then design. Do not start from a template.

Walk ${companyName} like a pre-sales lead. List 8-10 candidate use cases internally that an operator would recognize as THEIR job. Keep the ${numUseCases} strongest that:
1) map to how ${companyName} actually makes money, ships product, serves customers, or stays compliant,
2) are normal and valuable in ${domain},
3) can be shown in a short demo without inventing systems they do not have.

Then, for EACH kept use case, design its HTML tab as a different business screen — the way Hornets does Overview vs Fan 360 vs Ticketing vs Smart Venue. Ask: what would this person look at first on the floor? Pick the visual that answers that job. Do not put the same chart on every tab.

Return ONLY JSON:
{"useCases":[{"title":"","businessProblem":"","benefit":"","solutionFit":"","tabWhy":"","tabLayout":"live|profile|heat|table|flow","kpis":[{"name":"","why":""}],"dataPointer":{"description":"","availability":"existing|new","confidence":"confirmed|industry-typical"},"difficulty":"easier|moderate|harder","difficultyWhy":"","techComponents":["Microsoft Fabric"],"demoScore":9}],"overallBenefits":["","",""]}

Length limits (hard):
- title: max 8 words. Name the process, not the platform.
- businessProblem: max 28 words.
- benefit: max 22 words.
- tabWhy: exactly 2 short business sentences. (1) what this tab is for (2) why it matters on the floor. Max 36 words.
- tabLayout: YOU decide per use case after thinking about this brief. One of:
  live = live command center (stats, live bars, alerts) when the job is "what is happening now"
  profile = one record + next actions when the job is "who/what is this, what do I do"
  heat = zone/line heatmap when the job is "where is the risk"
  table = working table + guidance when the job is "which rows need a decision"
  flow = sources → Fabric → outcome when the job is "how it lands / trace a path"
- Prefer five different tabLayouts when the five jobs are different. Never default every tab to live or to the same chart.
- solutionFit: max 18 words.
- kpis: exactly 4. name max 4 words. why max 10 words. No invented current numbers.
- dataPointer.description: max 16 words.
- difficultyWhy: max 16 words. Cite research systems only.
- overallBenefits: exactly 4 lines, each max 18 words.
- techComponents: max 3 names.

Produce exactly ${numUseCases} use cases.`,
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
