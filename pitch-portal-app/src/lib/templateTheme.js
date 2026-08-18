// Visual theme extracted from
// `PPT and HTML Format/Harness Governed AI Data Modernization Solution.pptx`
// (Apexon Harness / AI Innovation Hub). Deck + mockup both read from here
// so they stay visually matched.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const TEMPLATE_DIR = path.resolve(__dirname, "../assets/template");
export const MASTER_BG_PATH = path.join(TEMPLATE_DIR, "master-bg.png");
export const LOGO_PATH = path.join(TEMPLATE_DIR, "apexon-logo-white.png");

export const TEMPLATE_PALETTE = {
  primary: "172440",
  secondary: "004B8D",
  accent: "E54A24",
  accentBlue: "75A2ED",
  cardBorder: "1D6EE4",
  dark: "0B1220",
  card: "0F2043",
  light: "F4F7FB",
  textDark: "1A1A1A",
  textLight: "FFFFFF",
  heading: "8EC8FF",
  fontTitle: "Arial",
  fontBody: "Helvetica",
};

export function getTemplatePalette() {
  return { ...TEMPLATE_PALETTE };
}

export function hasTemplateAssets() {
  return fs.existsSync(MASTER_BG_PATH) && fs.existsSync(LOGO_PATH);
}

export function logoDataUri() {
  if (!fs.existsSync(LOGO_PATH)) return "";
  return `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString("base64")}`;
}
