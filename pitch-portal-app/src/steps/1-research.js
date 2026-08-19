import { askAgentOrFallback } from "../lib/azureAgentClient.js";
import { extractJson } from "../lib/parseJson.js";
import { fallbackResearch } from "../lib/fallbacks.js";

function toText(structured, companyName, domain, requirement) {
  if (!structured || typeof structured !== "object") return "";
  const facts = Array.isArray(structured.verifiedFacts)
    ? structured.verifiedFacts.map((f) => f.fact || f).filter(Boolean).join(" ")
    : "";
  const systems = Array.isArray(structured.systems)
    ? structured.systems
        .map((s) => {
          const mark = s.confidence === "confirmed" ? "confirmed" : "typical for this industry, not confirmed at this company";
          return `${s.name} (${s.role || "system"} — ${mark})`;
        })
        .join("; ")
    : "";
  const reporting = Array.isArray(structured.reporting)
    ? structured.reporting.map((r) => r.name || r).filter(Boolean).join("; ")
    : "";
  const compliance = Array.isArray(structured.compliance) ? structured.compliance.join("; ") : "";
  return [
    structured.summary || `${companyName} operates in ${domain}.`,
    facts,
    systems ? `Data systems: ${systems}.` : "",
    reporting ? `Reporting landscape: ${reporting}.` : "",
    compliance ? `Controls that apply: ${compliance}.` : "",
    structured.requirementFit || `The mandate: ${requirement}.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function normalizeResearch(parsed, companyName, domain, requirement) {
  const structured = {
    summary: String(parsed.summary || "").trim(),
    verifiedFacts: Array.isArray(parsed.verifiedFacts) ? parsed.verifiedFacts.slice(0, 8) : [],
    systems: Array.isArray(parsed.systems) ? parsed.systems.slice(0, 10) : [],
    reporting: Array.isArray(parsed.reporting) ? parsed.reporting.slice(0, 6) : [],
    compliance: Array.isArray(parsed.compliance) ? parsed.compliance.slice(0, 6) : [],
    requirementFit: String(parsed.requirementFit || requirement).trim(),
  };
  return {
    structured,
    text: toText(structured, companyName, domain, requirement),
  };
}

export async function research({ companyName, domain, requirement }) {
  const fallbackText = fallbackResearch({ companyName, domain, requirement });

  const { value, source } = await askAgentOrFallback(
    `You are preparing a leadership briefing on ${companyName} (${domain}).

Mandate: "${requirement}"

Return ONLY JSON, no markdown:
{"summary":"","verifiedFacts":[{"fact":"","basis":""}],"systems":[{"name":"","role":"","confidence":"confirmed|industry-typical","basis":""}],"reporting":[{"name":"","confidence":"confirmed|industry-typical","basis":""}],"compliance":[""],"requirementFit":""}

Hard rules:
- summary: 2-3 sentences on what ${companyName} actually does. Public, checkable facts only.
- verifiedFacts: only items you can reasonably attribute to a public source (official site, filings, reputable news). Put the basis in "basis".
- systems: data platforms, ERP, CRM, MES, LIMS, warehouses, files/APIs this company uses — OR what companies in ${domain} typically use.
- If a system is not publicly confirmed for ${companyName}, set confidence to "industry-typical" and say so in basis. Never write it as if they confirmed it.
- reporting: how this industry typically reports (Power BI, Tableau, SAP, batch packs). Same confidence rule.
- Do not invent metrics, plant names, vendor contracts, or headcount.
- Do not assume they already run Microsoft Fabric unless that is public.
- requirementFit: how the mandate would land, in plain executive English, without inventing systems.`,
    () => null,
    "research"
  );

  if (value) {
    try {
      const parsed = extractJson(value);
      if (parsed?.summary || parsed?.systems) {
        const normalized = normalizeResearch(parsed, companyName, domain, requirement);
        if (normalized.text.length > 80) {
          return { ...normalized, source };
        }
      }
    } catch (err) {
      console.warn("research: JSON parse failed, using narrative text.", err.message);
    }
    if (String(value).length > 120 && !String(value).trim().startsWith("{")) {
      return { text: String(value).trim(), structured: null, source };
    }
  }

  return { text: fallbackText, structured: null, source: source === "azure" ? "mixed" : "fallback" };
}
