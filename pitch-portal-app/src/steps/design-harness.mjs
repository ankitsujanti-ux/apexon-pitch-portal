// Offline design harness. Runs on this machine, not on Render.
// Builds the package for every brief, then checks that agent-authored screens
// sanitize, slide regions do not overlap, and neighbouring compositions differ.
//
//   node src/steps/design-harness.mjs

import fs from "fs";
import os from "os";
import path from "path";
import { fallbackResearch, fallbackUseCases } from "../lib/fallbacks.js";
import { buildDeck } from "./3-deck.js";
import { buildMockup } from "./4-mockup.js";
import { sanitizeScreen } from "../lib/sanitizeScreen.js";
import { packRegions, regionsOverlap, outsideBody } from "../lib/slideGrid.js";
import { looksTruncated } from "../lib/text.js";
import { MIN_SCREENS, MAX_SCREENS } from "../lib/designContract.js";

const BRIEFS = [
  { companyName: "John Deere", domain: "Automotive Manufacturing", requirement: "exploring Microsoft Fabric and Real-Time Intelligence on Azure" },
  { companyName: "Northwind Foods", domain: "Food and Beverage", requirement: "see line yield while a run can still be corrected" },
  { companyName: "Cedar Ridge Health", domain: "Healthcare Provider", requirement: "cut claim denials before submission" },
  { companyName: "Halden Bank", domain: "Retail Banking", requirement: "spot payment fraud during the day" },
  { companyName: "Brightline Retail", domain: "Specialty Retail", requirement: "stop stockouts on promoted lines" },
  { companyName: "Ardent Logistics", domain: "Freight and Logistics", requirement: "predict late deliveries early enough to re-route" },
  { companyName: "Vantage Insurance", domain: "Property Insurance", requirement: "shorten claim cycle time on storm surges" },
  { companyName: "Orchard Grocers", domain: "Grocery Retail", requirement: "cut fresh food waste while keeping shelves full" },
];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "design-harness-"));
const failures = [];
let checks = 0;

function check(label, ok, detail) {
  checks += 1;
  if (!ok) failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
}

for (const [i, brief] of BRIEFS.entries()) {
  const { companyName, domain, requirement } = brief;
  const research = fallbackResearch({ companyName, domain, requirement });
  const pack = fallbackUseCases({ companyName, domain, requirement, numUseCases: 5, numMockupTabs: 5 });
  const n = pack.useCases.length;
  check(`${companyName}: count ${n} in ${MIN_SCREENS}-${MAX_SCREENS}`, n >= MIN_SCREENS && n <= MAX_SCREENS);

  const html = await buildMockup({
    companyName, domain, requirement,
    topUseCases: pack.useCases,
    hub: pack.hub,
    deckFileName: "deck.pptx",
  });
  await buildDeck({
    companyName, domain, requirement, research,
    researchStructured: { systems: [{ name: "ERP", role: "Orders", confidence: "industry-typical" }] },
    useCases: pack,
    outputPath: path.join(tmp, `deck-${i}.pptx`),
  });

  check(`${companyName}: no page scroll`, /overflow:\s*hidden/.test(html));
  check(`${companyName}: no tab strip`, !/role="tablist"/.test(html));
  check(`${companyName}: leadership kpis`, (html.match(/class="kpi"/g) || []).length >= 3);
  const headings = [
    ...[...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]),
    ...[...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1]),
  ];
  const cut = headings.filter((h) => looksTruncated(h));
  check(`${companyName}: no cut headings`, cut.length === 0, cut.join(" | "));

  const kindSeq = [];
  if (pack.hub?.screenHtml) {
    const cleaned = sanitizeScreen(pack.hub.screenHtml, { tabId: "h" });
    check(`${companyName}: hub sanitizes`, cleaned.ok, cleaned.reason);
  }
  for (const uc of pack.useCases) {
    const placed = packRegions(uc.slide?.regions || []);
    check(`${companyName}/${uc.title}: regions packed`, placed.length > 0);
    check(`${companyName}/${uc.title}: no overlap`, !regionsOverlap(placed));
    check(`${companyName}/${uc.title}: inside body`, !outsideBody(placed));
    kindSeq.push((uc.slide?.regions || []).map((r) => r.kind).join("+"));
  }
  check(`${companyName}: slide structures differ`, new Set(kindSeq).size === kindSeq.length, kindSeq.join(" | "));
}

fs.rmSync(tmp, { recursive: true, force: true });

if (failures.length) {
  console.error(`DESIGN-HARNESS FAIL — ${failures.length} of ${checks} checks`);
  failures.forEach((f) => console.error("  " + f));
  process.exit(1);
}
console.log(`DESIGN-HARNESS OK — ${checks} checks across ${BRIEFS.length} briefs`);
