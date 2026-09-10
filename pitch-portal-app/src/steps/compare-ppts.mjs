import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

function extractPptxText(pptxPath) {
  if (!fs.existsSync(pptxPath)) {
    return { error: `File not found: ${pptxPath}` };
  }
  const zip = new AdmZip(pptxPath);
  const zipEntries = zip.getEntries();
  const slideEntries = zipEntries
    .filter((e) => e.entryName.startsWith("ppt/slides/slide") && e.entryName.endsWith(".xml"))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/slide(\d+)\.xml/)?.[1] || "0", 10);
      const numB = parseInt(b.entryName.match(/slide(\d+)\.xml/)?.[1] || "0", 10);
      return numA - numB;
    });

  const slides = [];
  for (const entry of slideEntries) {
    const xml = entry.getData().toString("utf8");
    // Extract text inside <a:t>...</a:t>
    const matches = xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
    const texts = matches.map((m) => m.replace(/<a:t[^>]*>/, "").replace(/<\/a:t>/, "").trim()).filter(Boolean);
    slides.push({
      slideName: entry.entryName,
      slideNumber: slides.length + 1,
      textCount: texts.length,
      content: texts,
    });
  }
  return { path: pptxPath, totalSlides: slides.length, slides };
}

const targetPpt = path.resolve("../PPT_Output/Apollo_Hospitals_Fabric_AI_Operations.pptx");
const ourPpt = path.resolve("./output/apollo-hospitals-pitch-deck.pptx");

console.log("=== TARGET PPT (Built by another agent) ===");
const targetData = extractPptxText(targetPpt);
console.log(`Total Slides: ${targetData.totalSlides}`);
targetData.slides.forEach((s) => {
  console.log(`\n--- Slide ${s.slideNumber} ---`);
  console.log(s.content.join(" | "));
});

console.log("\n======================================================\n");

console.log("=== OUR GENERATED PPT (Current Agent) ===");
const ourData = extractPptxText(ourPpt);
console.log(`Total Slides: ${ourData.totalSlides}`);
ourData.slides.forEach((s) => {
  console.log(`\n--- Slide ${s.slideNumber} ---`);
  console.log(s.content.join(" | "));
});
