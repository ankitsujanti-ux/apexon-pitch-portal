// Palette for the pitch package. The Apexon Harness template in
// `PPT and HTML Format` is the standard visual — deck and mockup both
// call getPalette() so they always match.

import { getTemplatePalette } from "./templateTheme.js";

export function getPalette(_domain = "", _companyName = "") {
  return getTemplatePalette();
}
