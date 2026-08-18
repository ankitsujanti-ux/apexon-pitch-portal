import { askAgentOrFallback } from "../lib/azureAgentClient.js";
import { fallbackResearch } from "../lib/fallbacks.js";

export async function research({ companyName, domain, requirement }) {
  const { value, source } = await askAgentOrFallback(
    `You are preparing a client pitch for ${companyName} in the ${domain} industry.

Requirement to address: "${requirement}"

Write exactly 3 short paragraphs. No markdown, no bullets, no title.

Paragraph 1: What ${companyName} actually does — products or services, how they operate, and what "good" looks like for this business.
Paragraph 2: Typical IT systems and data sources in ${domain} for a company like ${companyName}. Name real system types used in this industry (for example ERP, MES, LIMS, CRM, WMS, historian, claims systems — only those that fit).
Paragraph 3: Domain-specific compliance or regulation, and how "${requirement}" would help ${companyName} specifically.

Be specific to ${companyName} and ${domain}. Do not write generic filler that could be pasted onto another company.`,
    () => fallbackResearch({ companyName, domain, requirement }),
    "research"
  );

  return { text: value, source };
}
