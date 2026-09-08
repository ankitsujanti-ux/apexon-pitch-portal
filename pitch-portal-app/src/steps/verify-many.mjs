// One self-check on one brief proves almost nothing: the failure modes we care
// about (borrowed product names, repeated slide compositions, consultant
// register, clipped or overflowing layout) only show up on briefs that differ
// from each other. So this builds the full package across many briefs and runs
// every gate on each one.
//
//   node src/steps/verify-many.mjs [runs]

import fs from "fs";
import os from "os";
import path from "path";
import { fallbackResearch, fallbackUseCases } from "../lib/fallbacks.js";
import { buildDeck } from "./3-deck.js";
import { buildMockup } from "./4-mockup.js";
import { lintUseCases, findVendorLeaks, findJargon, findLongSentences } from "../lib/toneGuard.js";
import { looksTruncated } from "../lib/text.js";
import { sanitizeScreen } from "../lib/sanitizeScreen.js";
import { packRegions, regionsOverlap, outsideBody } from "../lib/slideGrid.js";
import { MIN_SCREENS, MAX_SCREENS } from "../lib/designContract.js";

// Deliberately mixed: some name a platform (so it is allowed to appear), most
// name none (so nothing may be invented), across unrelated industries.
const BRIEFS = [
  { companyName: "Northwind Foods", domain: "Food and Beverage", requirement: "see line yield and quality holds while a run can still be corrected" },
  { companyName: "Cedar Ridge Health", domain: "Healthcare Provider", requirement: "cut claim denials by catching coding gaps before submission" },
  { companyName: "Halden Bank", domain: "Retail Banking", requirement: "spot payment fraud during the day instead of in overnight reports" },
  { companyName: "Brightline Retail", domain: "Specialty Retail", requirement: "stop stockouts on promoted lines during the promotion" },
  { companyName: "Vantage Insurance", domain: "Property Insurance", requirement: "shorten claim cycle time on storm surges" },
  { companyName: "Ardent Logistics", domain: "Freight and Logistics", requirement: "predict late deliveries early enough to re-route" },
  { companyName: "Kestrel Motors", domain: "Automotive Manufacturing", requirement: "find quality drift before scrap accumulates on the line" },
  { companyName: "Solaris Energy", domain: "Utilities", requirement: "reduce unplanned outage minutes across the distribution network" },
  { companyName: "Meridian Telecom", domain: "Telecommunications", requirement: "reduce churn among customers who had a service fault" },
  { companyName: "Fairhaven Pharma", domain: "Pharmaceutical", requirement: "shorten batch release time without weakening compliance" },
  { companyName: "Orchard Grocers", domain: "Grocery Retail", requirement: "cut fresh food waste while keeping shelves full" },
  { companyName: "Sterling Asset", domain: "Asset Management", requirement: "explain portfolio risk moves to clients on the same day" },
  { companyName: "Ironwood Construction", domain: "Construction", requirement: "keep multi-site projects on schedule when subcontractors slip" },
  { companyName: "Cascade Water", domain: "Water Utility", requirement: "detect network leaks earlier to cut non-revenue water" },
  { companyName: "Beacon Airlines", domain: "Aviation", requirement: "recover turnaround time when a gate change cascades" },
  // Briefs that DO name a platform — those names are then legitimate.
  { companyName: "Pinnacle Manufacturing", domain: "Industrial Manufacturing", requirement: "exploring Microsoft Fabric and Real-Time Intelligence on Azure" },
  { companyName: "Lakeshore Media", domain: "Media and Entertainment", requirement: "consolidate audience data on Databricks" },
  { companyName: "Granite Mining", domain: "Mining", requirement: "move reporting off Teradata onto Snowflake" },
];

const runs = Number(process.argv[2] || BRIEFS.length);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "verify-many-"));
const failures = [];
let checksRun = 0;

function check(label, brief, condition, detail) {
  checksRun += 1;
  if (!condition) failures.push(`[${brief.companyName}] ${label}${detail ? ` — ${detail}` : ""}`);
}

async function verify(brief, i) {
  const { companyName, domain, requirement } = brief;
  const research = fallbackResearch({ companyName, domain, requirement });
  const useCases = fallbackUseCases({ companyName, domain, requirement, numUseCases: 5, numMockupTabs: 5 });
  const n = useCases.useCases.length;
  check("screen count in range", brief, n >= MIN_SCREENS && n <= MAX_SCREENS, `got ${n}`);

  const deckPath = await buildDeck({
    companyName, domain, requirement, research,
    researchStructured: { systems: [{ name: "ERP", role: "Orders", confidence: "industry-typical" }] },
    useCases,
    outputPath: path.join(tmp, `deck-${i}.pptx`),
  });
  const html = await buildMockup({
    companyName, domain, requirement,
    topUseCases: useCases.useCases,
    hub: useCases.hub,
    deckFileName: `deck-${i}.pptx`,
    evidenceNote: "Public facts are cited; operational details are industry-typical until validated.",
  });

  // --- Nothing but the theme carries over -------------------------------
  const allText = [research, JSON.stringify(useCases), html].join("\n");
  const leaks = findVendorLeaks(allText, requirement);
  check("borrowed product names", brief, leaks.length === 0, leaks.join(", "));
  check(
    "no borrowed phase model",
    brief,
    !/Discover and assess|Plan and approve|Generate deliverables/i.test(allText)
  );
  check("no L1-L4 governance ladder", brief, !/"L[1-4]"|>L[1-4]</.test(allText));

  // --- Tone --------------------------------------------------------------
  const toneDefects = lintUseCases(useCases.useCases, requirement);
  check(
    "tone defects in use cases",
    brief,
    toneDefects.length === 0,
    toneDefects.slice(0, 4).map((d) => `${d.field}: ${d.kind}`).join("; ")
  );
  const researchJargon = findJargon(research);
  check("jargon in research", brief, researchJargon.length === 0, researchJargon.map((j) => j.word).join(", "));
  const longOnes = findLongSentences(research);
  check("over-long sentences in research", brief, longOnes.length === 0, `${longOnes.length} found`);

  // --- Slide variety (code-composed, not named templates) ----------------
  const seqs = useCases.useCases.map((uc, i) =>
    (uc.slide?.regions || []).map((r) => r.kind).filter(Boolean).join("+")
  );
  const kindsVary = seqs.filter(Boolean).length
    ? !seqs.some((s, i) => i && s && s === seqs[i - 1])
    : true;
  check("neighbouring slide compositions differ", brief, kindsVary, seqs.join(" | "));

  // --- Mockup is the product, not the deck -------------------------------
  for (const heading of ["The challenge", "How we solve it", "Works with what you have", "What is verified"]) {
    check(`html must not repeat deck section "${heading}"`, brief, !html.includes(heading));
  }
  const captions = (html.match(/class="caption"/g) || []).length;
  check("one caption on the leadership screen", brief, captions === 1, `found ${captions}`);

  // --- Layout hygiene ----------------------------------------------------
  const css = html.slice(0, html.indexOf("</style>"));
  const declared = new Set([...css.matchAll(/--fs-[a-z0-9]+:\s*([\d.]+)px/g)].map((m) => m[1]));
  const offScale = [...new Set([...html.matchAll(/font-size:\s*([\d.]+)px/g)].map((m) => m[1]))]
    .filter((s) => !declared.has(s));
  check("font sizes on the type scale", brief, offScale.length === 0, `${offScale.join(", ")}px`);
  check("long labels ellipsis rather than clip", brief, /text-overflow:\s*ellipsis/.test(css));
  check("no page scroll", brief, /overflow:\s*hidden/.test(css));
  check("one leadership screen, no tabs", brief, !/role="tablist"/.test(html) && /Leadership view/.test(html));
  check("hub shows use-case KPIs", brief, (html.match(/class="kpi"/g) || []).length >= 3);
  check("one hub layout", brief, [...html.matchAll(/data-layout="([^"]+)"/g)].length === 1);

  if (useCases.hub?.screenHtml) {
    const cleaned = sanitizeScreen(useCases.hub.screenHtml, { tabId: "v" });
    check("hub screenHtml sanitizes", brief, cleaned.ok, cleaned.reason);
  }
  for (const uc of useCases.useCases) {
    if (uc.slide?.regions?.length) {
      const placed = packRegions(uc.slide.regions);
      check(`${uc.title}: regions do not overlap`, brief, !regionsOverlap(placed));
      check(`${uc.title}: regions stay in the body`, brief, !outsideBody(placed));
    }
  }

  // --- Nothing reads as cut off ------------------------------------------
  // Headings and labels are the slots that used to end mid-phrase ("Prevent
  // line", "…control systems so"). Body copy may carry a deliberate ellipsis;
  // a heading never may.
  const headings = [
    ...[...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]),
    ...[...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1]),
    ...[...html.matchAll(/class="kicker"[^>]*>([^<]+)</g)].map((m) => m[1]),
  ].map((s) => s.replace(/&amp;/g, "&").trim());
  const cut = headings.filter((h) => looksTruncated(h));
  check("no heading reads as cut off", brief, cut.length === 0, cut.join(" | "));

  // A leftover tab strip is a failed leadership screen.
  const tabLabels = [...html.matchAll(/class="tab[^"]*"[^>]*>([^<]+)</g)].map((m) => m[1].trim());
  check("no leftover tab labels", brief, tabLabels.length === 0, tabLabels.join(" | "));

  // --- Theme survives ----------------------------------------------------
  check("dark navy theme intact", brief, /#0[0-9A-Fa-f]{5}|--navy/.test(css));
  check("deck was written", brief, fs.existsSync(deckPath) && fs.statSync(deckPath).size > 50_000);

  return { leaks, toneDefects };
}

let worstTone = 0;
for (let i = 0; i < runs; i += 1) {
  const brief = BRIEFS[i % BRIEFS.length];
  const { toneDefects } = await verify(brief, i);
  worstTone = Math.max(worstTone, toneDefects.length);
  process.stdout.write(failures.length ? "x" : ".");
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log("");

if (failures.length) {
  console.error(`\nFAILED — ${failures.length} of ${checksRun} checks across ${runs} briefs:\n`);
  for (const f of [...new Set(failures)]) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`VERIFY-MANY OK — ${checksRun} checks passed across ${runs} briefs (${BRIEFS.length} distinct).`);
