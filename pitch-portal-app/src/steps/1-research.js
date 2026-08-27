import { askAgentOrFallback } from "../lib/azureAgentClient.js";
import { extractJson } from "../lib/parseJson.js";
import { fallbackResearch } from "../lib/fallbacks.js";
import { BRIEF_FIRST_RULE } from "../lib/briefFirst.js";

function toText(structured, companyName, domain, requirement) {
  if (!structured || typeof structured !== "object") return "";
  const facts = Array.isArray(structured.verifiedFacts)
    ? structured.verifiedFacts.map((f) => f.fact || f).filter(Boolean).join(" ")
    : "";
  const walk = structured.operationsWalk || "";
  const morning = structured.leadershipMorning || "";
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
  const implications = Array.isArray(structured.implications)
    ? structured.implications
        .map((i) => {
          const finding = i.finding || i;
          const why = i.whyItMatters ? ` Why it matters: ${i.whyItMatters}` : "";
          const opp = i.opportunity ? ` Opportunity: ${i.opportunity}` : "";
          return `${finding}${why}${opp}`;
        })
        .filter(Boolean)
        .join(" ")
    : "";
  const known = Array.isArray(structured.knownFacts) ? structured.knownFacts.filter(Boolean).join(" ") : "";
  const assumptions = Array.isArray(structured.assumptions) ? structured.assumptions.filter(Boolean).join(" ") : "";
  const hypotheses = Array.isArray(structured.hypotheses) ? structured.hypotheses.filter(Boolean).join(" ") : "";
  return [
    structured.summary || `${companyName} operates in ${domain}.`,
    walk,
    morning,
    known ? `Known facts: ${known}` : "",
    assumptions ? `Assumptions (not confirmed): ${assumptions}` : "",
    hypotheses ? `Hypotheses to test: ${hypotheses}` : "",
    implications ? `Business implications: ${implications}` : "",
    facts,
    structured.company?.whatTheyDo ? `This company: ${structured.company.whatTheyDo}` : "",
    Array.isArray(structured.industry?.pressures) && structured.industry.pressures.length
      ? `Industry pressures: ${structured.industry.pressures.join("; ")}`
      : "",
    structured.intersection ? `Where they meet: ${structured.intersection}` : "",
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
    operationsWalk: String(parsed.operationsWalk || "").trim(),
    leadershipMorning: String(parsed.leadershipMorning || "").trim(),
    knownFacts: Array.isArray(parsed.knownFacts) ? parsed.knownFacts.slice(0, 8) : [],
    assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions.slice(0, 6) : [],
    hypotheses: Array.isArray(parsed.hypotheses) ? parsed.hypotheses.slice(0, 6) : [],
    implications: Array.isArray(parsed.implications) ? parsed.implications.slice(0, 6) : [],
    verifiedFacts: Array.isArray(parsed.verifiedFacts) ? parsed.verifiedFacts.slice(0, 8) : [],
    systems: Array.isArray(parsed.systems) ? parsed.systems.slice(0, 10) : [],
    reporting: Array.isArray(parsed.reporting) ? parsed.reporting.slice(0, 6) : [],
    compliance: Array.isArray(parsed.compliance) ? parsed.compliance.slice(0, 6) : [],
    company: parsed.company && typeof parsed.company === "object" ? parsed.company : {},
    industry: parsed.industry && typeof parsed.industry === "object" ? parsed.industry : {},
    intersection: String(parsed.intersection || "").trim(),
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
    `${BRIEF_FIRST_RULE}

You are an Apexon enterprise pitch strategist walking into ${companyName} (${domain}) tomorrow.

Mandate from the account team: "${requirement}"

Do a deep brief on THIS company in THIS industry before any use case is proposed. Walk their real operation — plant, store, claims desk, branch, warehouse, clinic, network — whichever THEY run. Do not default to a factory if they are not a manufacturer.

Search what is public first: official site, investor filings, annual reports, reputable news. List what you can source. Then, and only then, fill gaps with industry-typical practice — labelled as such. Do not invent a walk from generic industry knowledge and present it as this company.

Do not merely collect facts. Translate every important finding into a BUSINESS IMPLICATION: why it matters to this client, and what problem or opportunity it creates.

Return ONLY JSON, no markdown:
{"summary":"","operationsWalk":"","leadershipMorning":"","knownFacts":[""],"assumptions":[""],"hypotheses":[""],"implications":[{"finding":"","whyItMatters":"","opportunity":""}],"verifiedFacts":[{"fact":"","basis":""}],"systems":[{"name":"","role":"","confidence":"confirmed|industry-typical","basis":""}],"reporting":[{"name":"","confidence":"confirmed|industry-typical","basis":""}],"compliance":[""],"company":{"whatTheyDo":"","priorities":[""],"publicChallenges":[""]},"industry":{"processes":[""],"kpis":[""],"pressures":[""]},"intersection":"","requirementFit":""}

Hard rules:
- summary: 2 short sentences a business stakeholder would nod at. Public, checkable facts only. Name products, plants, channels, or customers only if public.
- operationsWalk: 4-6 sentences walking how THIS company actually works day to day, in ${domain} language. Who does the work, where the delay or risk sits, what a missed window costs.
- leadershipMorning: 2-3 sentences on what a ${domain} VP at a company like ${companyName} would want on one screen at the start of the day. Name the metrics in their words, then say what each means.
- Company research and industry research are different. Fill company (what they do, priorities, public challenges) from THIS firm. Fill industry (processes, typical KPIs, pressures) from the sector. intersection: one or two sentences on where THIS company's operation meets the industry problem — that is where use cases must live.
- knownFacts: only public, checkable items. assumptions: industry-typical, said as assumptions. hypotheses: what we would test in discovery.
- implications: 3-6 items. finding 8-16 words. whyItMatters 10-18 words. opportunity 10-18 words — a business decision, not a dashboard name.
- verifiedFacts: only items you can reasonably attribute to a public source. Put the basis in "basis" as a site name or URL. If you cannot source it, do not list it.
- systems: operational systems a ${domain} company like this typically runs, and what each is used for in THEIR process.
- If a system is not publicly confirmed for ${companyName}, set confidence to "industry-typical" and say so in basis. Never write it as if they confirmed it.
- reporting: how THIS industry typically reports today. Same confidence rule.
- Do not invent metrics, plant names, vendor contracts, or headcount.
- Do not assume they already run any named platform unless that is public or named in the mandate.
- requirementFit: one or two sentences on how the mandate would show up in their day-to-day operations.
- JSON must parse with JSON.parse. No markdown, no citation tokens, no markdown links inside values.
- confidence must be exactly "confirmed" or "industry-typical".`,
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
