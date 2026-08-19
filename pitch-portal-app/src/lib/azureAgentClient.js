// Shared Azure AI Foundry agent client — same DemoAgent endpoint as local.
// Does not create or change anything in Azure AI Foundry.
// Uses the existing InteractiveBrowserCredential + .auth-record.json login.
// Optional AZURE_CLIENT_* env vars are used only if already present.

import fs from "fs";
import OpenAI from "openai";
import {
  ClientSecretCredential,
  InteractiveBrowserCredential,
  serializeAuthenticationRecord,
  deserializeAuthenticationRecord,
  useIdentityPlugin,
} from "@azure/identity";

const AUTH_RECORD_PATH = "./.auth-record.json";
const AGENT_SCOPE = "https://ai.azure.com/.default";
const AGENT_BASE_URL =
  "https://fabric-acelerator-poc.services.ai.azure.com/api/projects/fabric-acelerator-project/agents/DemoAgent/endpoint/protocols/openai";

const AGENT_TIMEOUT_MS = 180000;

let credential = null;
let clientPromise = null;

export function allowLocalFallback() {
  return process.env.NODE_ENV !== "production" && process.env.REQUIRE_AZURE !== "1";
}

function hasServicePrincipal() {
  return Boolean(
    process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET
  );
}

async function getCredential() {
  if (credential) return credential;

  if (hasServicePrincipal()) {
    credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID,
      process.env.AZURE_CLIENT_ID,
      process.env.AZURE_CLIENT_SECRET
    );
    return credential;
  }

  const onAppService = Boolean(process.env.WEBSITE_INSTANCE_ID);
  if (!onAppService) {
    try {
      const { cachePersistencePlugin } = await import("@azure/identity-cache-persistence");
      useIdentityPlugin(cachePersistencePlugin);
    } catch (err) {
      console.warn("Azure token cache persistence is unavailable; browser login will still work.", err.message);
    }
  }

  let authenticationRecord;
  if (fs.existsSync(AUTH_RECORD_PATH)) {
    authenticationRecord = deserializeAuthenticationRecord(
      fs.readFileSync(AUTH_RECORD_PATH, "utf8")
    );
  }

  credential = new InteractiveBrowserCredential({
    ...(onAppService ? {} : { tokenCachePersistenceOptions: { enabled: true } }),
    authenticationRecord,
  });

  if (!authenticationRecord) {
    if (onAppService) {
      throw new Error(
        "No saved Azure login on the server. The live API reuses the same DemoAgent login as local (.auth-record.json)."
      );
    }
    const record = await credential.authenticate(AGENT_SCOPE);
    fs.writeFileSync(AUTH_RECORD_PATH, serializeAuthenticationRecord(record));
  }

  return credential;
}

async function createClient() {
  const cred = await getCredential();
  return new OpenAI({
    baseURL: AGENT_BASE_URL,
    apiKey: async () => {
      const token = await cred.getToken(AGENT_SCOPE);
      if (!token?.token) {
        throw new Error("Could not get an Azure AI Foundry access token. Check the service principal or sign in again.");
      }
      return token.token;
    },
    maxRetries: 0,
    timeout: AGENT_TIMEOUT_MS,
    defaultQuery: { "api-version": "2025-11-15-preview" },
  });
}

export function getAzureAgentClient() {
  if (!clientPromise) clientPromise = createClient();
  return clientPromise;
}

export function resetAzureAgentClient() {
  clientPromise = null;
  credential = null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorStatus(err) {
  return err?.status ?? err?.statusCode ?? err?.response?.status;
}

function errorMessage(err) {
  return String(err?.error?.message || err?.message || "");
}

export function isTransientAgentError(err) {
  const status = errorStatus(err);
  const message = errorMessage(err);
  if (status === 429 || (status >= 500 && status < 600)) return true;
  if (/server had an error processing your request/i.test(message)) return true;
  if (err?.code === "ETIMEDOUT" || err?.code === "ECONNRESET" || err?.code === "ERR_CANCELED") return true;
  if (/timed out|timeout/i.test(message)) return true;
  return false;
}

async function callAgentOnce(client, input) {
  const response = await client.responses.create({ input });
  const text = response.output_text?.trim();
  if (text) return text;

  const chat = await client.chat.completions.create({
    messages: [{ role: "user", content: input }],
  });
  const chatText = chat.choices?.[0]?.message?.content?.trim();
  if (!chatText) throw new Error("Azure agent returned an empty response");
  return chatText;
}

export async function askAgent(input, { retries = 1 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      if (attempt > 1) resetAzureAgentClient();
      const client = await getAzureAgentClient();
      return await callAgentOnce(client, input);
    } catch (err) {
      lastErr = err;
      const retryable = isTransientAgentError(err) || /empty response/i.test(errorMessage(err));
      if (!retryable || attempt === retries + 1) throw err;
      const waitMs = 2500 * attempt;
      console.warn(
        `askAgent: Azure Foundry hiccup (attempt ${attempt}/${retries + 1}). Retrying in ${waitMs / 1000}s...`
      );
      resetAzureAgentClient();
      await sleep(waitMs);
    }
  }
  throw lastErr;
}

export async function askAgentOrFallback(input, fallbackFn, label = "agent") {
  try {
    const text = await askAgent(input, { retries: 1 });
    console.log(`[${label}] Azure Foundry returned ${text.length} characters.`);
    return { value: text, source: "azure" };
  } catch (err) {
    if (!allowLocalFallback()) {
      throw new Error(
        `Azure AI Foundry failed (${errorMessage(err)}). The live portal does not publish generic fallback use cases.`
      );
    }
    console.warn(`[${label}] Azure Foundry failed (${errorMessage(err)}). Using local fallback.`);
    return { value: fallbackFn(), source: "fallback" };
  }
}
