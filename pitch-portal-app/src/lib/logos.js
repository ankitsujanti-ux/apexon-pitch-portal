import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const LOGO_DIR = path.resolve(__dirname, "../assets/logos");

const FILES = {
  apexon: "apexon.png",
  mysql: "mysql.png",
  postgres: "postgres.png",
  snowflake: "snowflake.png",
  teradata: "teradata.png",
  fabric: "fabric.png",
  fabricF: "fabric-f.png",
  lakehouse: "lakehouse.png",
  pipelines: "pipelines.png",
  semantic: "semantic.png",
  rdbms: "rdbms.png",
  files: "files.png",
  ai: "ai.png",
  quality: "quality.png",
};

export function logoPath(key) {
  const file = FILES[key];
  if (!file) return null;
  const full = path.join(LOGO_DIR, file);
  return fs.existsSync(full) ? full : null;
}

export function logoDataUri(key) {
  const full = logoPath(key);
  if (!full) return "";
  return `data:image/png;base64,${fs.readFileSync(full).toString("base64")}`;
}

export function logoKeyForSystem(name) {
  const t = String(name || "").toLowerCase();
  if (/mysql/.test(t)) return "mysql";
  if (/postgres|postgresql/.test(t)) return "postgres";
  if (/snowflake/.test(t)) return "snowflake";
  if (/teradata/.test(t)) return "teradata";
  if (/fabric/.test(t)) return "fabric";
  if (/file|api|csv|sftp|blob/.test(t)) return "files";
  if (/sql server|oracle|sap|db2|sybase|rdbms|erp|mes|lims|crm|wms|ehr|core bank/.test(t)) {
    return "rdbms";
  }
  return "rdbms";
}
