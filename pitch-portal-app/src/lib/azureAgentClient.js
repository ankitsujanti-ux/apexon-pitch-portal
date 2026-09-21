// Azure Anthropic Claude Agent Client (claude-opus-5)
// Connects directly to Azure AI Foundry Anthropic messages endpoint.

import dotenv from "dotenv";

dotenv.config();

const ANTHROPIC_ENDPOINT =
  process.env.AZURE_ANTHROPIC_ENDPOINT ||
  "https://demo-pitch-portal-resource.services.ai.azure.com/anthropic/v1/messages";

const ANTHROPIC_KEY =
  process.env.AZURE_ANTHROPIC_KEY ||
  process.env.ANTHROPIC_API_KEY ||
  "";

const ANTHROPIC_MODEL = process.env.AZURE_ANTHROPIC_MODEL || "claude-opus-5";

const TIMEOUT_MS = 120000;

export function allowLocalFallback() {
  return process.env.REQUIRE_AZURE !== "1";
}

function errorMessage(err) {
  return String(err?.error?.message || err?.message || "");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callClaudeAnthropic(input) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ANTHROPIC_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 8192,
        thinking: {
          type: "adaptive",
        },
        output_config: {
          effort: "low",
        },
        messages: [{ role: "user", content: input }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Claude API HTTP ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    const textBlocks = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!textBlocks) {
      throw new Error("Claude returned an empty text response");
    }

    return textBlocks;
  } finally {
    clearTimeout(timer);
  }
}

export async function askAgent(input, { retries = 1 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await callClaudeAnthropic(input);
    } catch (err) {
      lastErr = err;
      if (attempt === retries + 1) throw err;
      const waitMs = 2000 * attempt;
      console.warn(
        `askAgent: Claude hiccup (attempt ${attempt}/${retries + 1}). Retrying in ${waitMs / 1000}s... (${err.message})`
      );
      await sleep(waitMs);
    }
  }
  throw lastErr;
}

export async function askAgentOrFallback(input, fallbackFn, label = "agent") {
  try {
    const text = await askAgent(input, { retries: 1 });
    console.log(`[${label}] Claude (${ANTHROPIC_MODEL}) returned ${text.length} characters.`);
    return { value: text, source: "azure" };
  } catch (err) {
    if (!allowLocalFallback()) {
      throw new Error(
        `Claude API failed (${errorMessage(err)}). The live portal does not publish generic fallback use cases.`
      );
    }
    console.warn(`[${label}] Claude API failed (${errorMessage(err)}). Using local fallback.`);
    return { value: fallbackFn(), source: "fallback" };
  }
}
