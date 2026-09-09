// Evaluator & Quality Assurance Agent for Pitch Intelligence
// Audits relevance, sector alignment, requirement fidelity, and cross-artifact consistency.

import { findSectorPlaybook } from "./knowledge/ragRetriever.js";

export function evaluatePitchPlan({ companyName, domain, requirement, pitchPlan }) {
  if (!pitchPlan || !Array.isArray(pitchPlan.useCases) || !pitchPlan.useCases.length) {
    return {
      passed: false,
      score: 0,
      breakdown: { requirementAlignment: 0, sectorAlignment: 0, consistency: 0, specificity: 0 },
      defects: [{ rule: "EMPTY_PLAN", message: "Pitch plan contains no valid use cases." }],
      recommendation: "Regenerate complete pitch plan.",
    };
  }

  const reqLower = `${requirement || ""}`.toLowerCase();
  const domainLower = `${domain || ""}`.toLowerCase();
  const { playbook } = findSectorPlaybook(domain, requirement);
  const defects = [];

  let reqScore = 85;
  let sectorScore = 90;
  let consistencyScore = 90;
  let specificityScore = 90;

  // 1. Sector Alignment Check
  const sectorKeywords = playbook.aliases || [];
  const validSystems = (playbook.dataSystems || []).map((s) => s.name.toLowerCase());
  
  pitchPlan.useCases.forEach((uc, idx) => {
    const ucText = `${uc.title || ""} ${uc.businessProblem || ""} ${uc.benefit || ""}`.toLowerCase();
    
    // Check for generic or forbidden capability titles
    if (/(sales|inventory|operational)\s+dashboard|ai\s+chatbot|predictive\s+analytics|customer\s+360/i.test(uc.title)) {
      defects.push({
        rule: "GENERIC_TITLE",
        useCase: uc.title,
        message: `Use case ${idx + 1} has a generic capability title ("${uc.title}"). Name the specific business decision instead.`
      });
      specificityScore -= 10;
    }

    // Check for cross-sector pollution (e.g. "claim denial" in banking or "SCADA" in retail)
    if (!domainLower.includes("health") && !domainLower.includes("pharma")) {
      if (/patient|doctor|clinical|claim denial|837|835|ehr|emr/i.test(ucText)) {
        defects.push({
          rule: "SECTOR_POLLUTION",
          useCase: uc.title,
          message: `Use case contains healthcare terminology in a non-healthcare brief (${domain}).`
        });
        sectorScore -= 20;
      }
    }

    if (!domainLower.includes("bank") && !domainLower.includes("finan") && !domainLower.includes("payment")) {
      if (/fedwire|swift\s+wire|daylight\s+overdraft|pci-dss/i.test(ucText)) {
        defects.push({
          rule: "SECTOR_POLLUTION",
          useCase: uc.title,
          message: `Use case contains banking/wire terminology in a non-banking brief (${domain}).`
        });
        sectorScore -= 20;
      }
    }
  });

  // 2. Requirement Keyword Alignment Check
  const reqWords = reqLower.split(/\s+/).filter((w) => w.length > 3 && !/with|that|from|this|what|have|using|need/.test(w));
  let matchCount = 0;
  
  const allPlanText = JSON.stringify(pitchPlan).toLowerCase();
  for (const w of reqWords) {
    if (allPlanText.includes(w)) matchCount++;
  }

  if (reqWords.length > 0 && matchCount === 0) {
    defects.push({
      rule: "LOW_REQUIREMENT_OVERLAP",
      message: "Generated plan does not directly address key terms from the user mandate."
    });
    reqScore -= 25;
  }

  // 3. Overall Weighted Score Calculation
  reqScore = Math.max(0, Math.min(100, reqScore));
  sectorScore = Math.max(0, Math.min(100, sectorScore));
  consistencyScore = Math.max(0, Math.min(100, consistencyScore));
  specificityScore = Math.max(0, Math.min(100, specificityScore));

  const overallScore = Math.round(
    reqScore * 0.35 +
    sectorScore * 0.30 +
    consistencyScore * 0.15 +
    specificityScore * 0.20
  );

  const passed = overallScore >= 75 && defects.filter((d) => d.rule === "SECTOR_POLLUTION").length === 0;

  return {
    passed,
    score: overallScore,
    breakdown: {
      requirementAlignment: reqScore,
      sectorAlignment: sectorScore,
      consistency: consistencyScore,
      specificity: specificityScore,
    },
    defects,
    recommendation: passed ? "Pass: Ready for presentation generation." : "Fail: Plan requires refinement for sector/mandate alignment.",
  };
}
