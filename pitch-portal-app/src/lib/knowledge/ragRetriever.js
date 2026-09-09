// Hybrid RAG Retriever for Pitch Intelligence
// Matches user brief against sector playbooks and use-case libraries.

import { SECTOR_PLAYBOOKS } from "./sectorPlaybooks.js";

export function findSectorPlaybook(domain = "", requirement = "") {
  const query = `${domain} ${requirement}`.toLowerCase();
  
  for (const [key, playbook] of Object.entries(SECTOR_PLAYBOOKS)) {
    if (playbook.aliases.some((alias) => query.includes(alias))) {
      return { key, playbook };
    }
  }
  
  return { key: "manufacturing", playbook: SECTOR_PLAYBOOKS.manufacturing };
}

export function retrieveGroundingKnowledge({ companyName, domain, requirement, research }) {
  const { key, playbook } = findSectorPlaybook(domain, requirement);
  const reqLower = `${requirement || ""}`.toLowerCase();
  
  // Score use-case library patterns by keyword relevance
  const scoredUseCases = (playbook.useCaseLibrary || []).map((uc) => {
    let score = 0;
    for (const kw of uc.keywords || []) {
      if (reqLower.includes(kw.toLowerCase())) {
        score += 3;
      }
    }
    return { ...uc, relevanceScore: score };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);

  const topMatches = scoredUseCases.filter((uc) => uc.relevanceScore > 0);
  const candidateLibrary = topMatches.length ? topMatches : (playbook.useCaseLibrary || []);

  const knowledgePack = {
    sector: playbook.sector,
    key,
    businessAreas: playbook.businessAreas || [],
    commonKpis: (playbook.commonKpis || []).slice(0, 6),
    dataSystems: playbook.dataSystems || [],
    complianceGuards: playbook.complianceGuards || [],
    topUseCasePatterns: candidateLibrary.slice(0, 3),
  };

  const formattedContext = `
SECTOR PLAYBOOK: ${knowledgePack.sector}
CORE BUSINESS DOMAINS:
${knowledgePack.businessAreas.map((a) => `• ${a}`).join("\n")}

TYPICAL OPERATIONAL SYSTEMS & FEEDS:
${knowledgePack.dataSystems.map((s) => `• ${s.name} (${s.role})`).join("\n")}

INDUSTRY-STANDARD BENCHMARK KPIS:
${knowledgePack.commonKpis.map((k) => `• ${k.name}: ${k.why}`).join("\n")}

RELEVANT SECTOR USE-CASE PATTERNS:
${knowledgePack.topUseCasePatterns.map((uc) => `• [${uc.name}]: Problem: ${uc.businessProblem} | Moves: ${uc.solutionMoves?.map((m) => m.lead).join(" → ")}`).join("\n")}

COMPLIANCE & GOVERNANCE GUARDS:
${knowledgePack.complianceGuards.map((g) => `• ${g.title}: ${g.body}`).join("\n")}
`.trim();

  return {
    raw: knowledgePack,
    formattedText: formattedContext,
  };
}
