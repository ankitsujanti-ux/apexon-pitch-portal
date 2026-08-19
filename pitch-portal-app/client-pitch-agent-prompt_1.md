# Client Pitch & Mockup Agent — Final Prompt Template

## Inputs (fill in from the landing screen)

- **Company name:** `{{COMPANY_NAME}}`
- **Domain / industry:** `{{DOMAIN}}`
- **Requirement:** `{{REQUIREMENT}}` (free text — carries the specific technology/solution angle, e.g. "exploring Microsoft Fabric and Real-Time Intelligence on Azure," or any other platform/initiative)
- **GitHub repository:** `{{GITHUB_REPO}}` — default: `ankitsujanti-ux/GoogleColab` (Pages already enabled on `main`, live at `https://ankitsujanti-ux.github.io/GoogleColab/`) — where each client's pitch package gets published
- **Optional attachment:** an existing branded template file (deck, style guide, or brand asset) to reuse as the visual style. If none is provided, the agent should choose an appropriate professional palette instead of guessing at one that doesn't exist.
- **Optional tuning:** number of use cases to generate (default 5), number of use cases to turn into interactive mockup tabs (default 3)

---

## The Prompt (send everything below to the agent, with placeholders filled in)

You are building a solutioning/pitch package for `{{COMPANY_NAME}}`, in the `{{DOMAIN}}` domain, based on this requirement: "`{{REQUIREMENT}}`". Follow the steps below in order. Every decision needed is already specified here — don't stop to ask clarifying questions unless something above is genuinely contradictory or missing (e.g., no domain given).

### Step 1 — Research

Research `{{COMPANY_NAME}}`: its core business, its probable IT structure, and the data sources typically found in the `{{DOMAIN}}` domain — name the actual systems and data types common to that specific industry (not generic filler that could apply to any business). Note any domain-specific regulatory or compliance considerations relevant to `{{DOMAIN}}` that a solution addressing "`{{REQUIREMENT}}`" would need to respect. If working interactively with a user, show your plan before researching and summarize findings before moving to Step 2; if running unattended, proceed directly and state your findings before Step 2's output.

### Step 2 — Use case brainstorming

Based on the research, the stated requirement, and standard patterns in the `{{DOMAIN}}` industry, first brainstorm broadly — generate more candidate use cases than you need — then narrow down to the `{{NUM_USE_CASES, default 5}}` strongest ones addressable by "`{{REQUIREMENT}}`" for this specific company. Rules:

- Favor use cases that are genuinely common and valuable in `{{DOMAIN}}` specifically. Reject anything generic enough to paste into a different industry's deck unchanged.
- Do the full brainstorm before finalizing, so the kept use cases are as close to 100% relevant to how a company like `{{COMPANY_NAME}}` actually operates as possible — not textbook-generic examples.
- Write every explanation in simple, non-technical language a non-technical business stakeholder can follow — no unexplained jargon.
- For each use case, produce:
  - Title
  - The business problem, in plain language
  - How the proposed solution/technology addresses it, in plain language
  - A data pointer — what specific data is needed to support it, and whether the company most likely already has that data today or would need a new source, integration, or data-sharing agreement to get it
  - The specific technology components involved (cloud services, platforms, or tools relevant to "`{{REQUIREMENT}}`")
- Identify the single strongest / most visually demo-able use case, and rank the top `{{NUM_MOCKUP_TABS, default 3}}` for use in Step 4.
- If working interactively, check in with the user with this full list before proceeding to Step 3; if running unattended, proceed directly.

### Step 3 — Pitch deck (.pptx)

Build a PowerPoint deck with this structure: title slide; a client + domain context slide (who the company is, typical `{{DOMAIN}}` data sources, relevant compliance considerations, and a restatement of the requirement); one slide per use case from Step 2; a closing slide.

- If a template file was attached, extract and reuse its actual visual theme — background art, logo images, color palette, and fonts — rather than inventing a new design. This is the company's standard format and must be matched, not reinterpreted.
- If no template was attached, choose a bold, industry-appropriate color palette (one dominant color, 1–2 supporting tones, one sharp accent; dark backgrounds for title/closing slides, light or card-based for content slides) and apply it consistently across every slide. Avoid a generic default-blue, unstyled deck.
- Quality bar: no text overflow or cut-off content, no leftover placeholder text, consistent margins and spacing, every slide has a visual element (not just bullet text). Validate that the generated file opens cleanly and visually inspect a rendering of every slide before calling it done.

### Step 4 — Interactive HTML mockup

Build one self-contained interactive HTML file (all CSS/JS inline, no required external files) containing a tabbed dashboard covering the top `{{NUM_MOCKUP_TABS, default 3}}` use cases identified in Step 2, each as its own clickable tab.

Per tab, build a live, continuously-animating simulated dashboard relevant to that specific use case:

- A row of KPI stat tiles relevant to that use case.
- At least one live-updating chart (e.g., a time-series view) and one distribution/breakdown visual (e.g., a stacked bar or donut).
- A live-updating list/feed of individual records relevant to the use case, color-coded by status — every status color must ship with an icon + text label, never color alone.
- At least one interactive control that lets the viewer trigger a notable event on demand and see the dashboard visibly react (a new record appears, a KPI updates, an alert/toast appears).
- A visible disclaimer stating the data shown is synthetic/illustrative and not connected to any real company system.

**Info ("i") buttons — required everywhere:**

- Every KPI tile gets a small "i" info icon. On hover/click, it shows a crisp, plain-language explanation no longer than two lines of what that KPI means and why it matters.
- Every chart gets a small "i" info icon with its own crisp two-line, plain-language explanation of what the chart shows and how to read it.
- The overall dashboard gets one page-level "i" info button (e.g., near the header) with a crisp two-line explanation of the whole tool's purpose and intended audience.
- Keep every explanation to two short lines, written for a non-technical business audience — no long paragraphs.

**Visual and technical requirements:**

- Match the pitch deck's palette and fonts exactly — reuse the same logo/background assets if a template was available in Step 3, or the chosen fallback palette otherwise.
- Never use accent-color stripes or bars as decoration; use whitespace, card backgrounds, and icon circles instead.
- Must be responsive: usable at both a desktop-width layout and a narrow mobile layout — stack elements, allow horizontal scroll on dense tables rather than squeezing columns unreadably, and don't let floating alerts cover key KPI numbers.
- No localStorage/sessionStorage — keep all state in memory.
- Before finishing, render the page at both a desktop and a mobile viewport for every tab and check for overlapping elements, cut-off text, or broken layout. Fix anything found.

### Step 5 — Publish

Push both deliverables to the `{{GITHUB_REPO}}` repository (default: `ankitsujanti-ux/GoogleColab`), in a new top-level folder named after `{{COMPANY_NAME}}` (URL-safe slug, e.g. `contoso-retail`), matching the existing pattern used by folders like `hornets-fabric-demo`:

- `{{COMPANY_NAME}}/index.html` — the interactive mockup
- `{{COMPANY_NAME}}/{{COMPANY_NAME}}-pitch-deck.pptx` — the deck, committed for storage/record-keeping (not rendered by Pages)

GitHub Pages is already enabled on `main` for this repo — no setup step needed, the new folder becomes reachable automatically once pushed. Confirm the resulting public URL (`https://ankitsujanti-ux.github.io/GoogleColab/{{COMPANY_NAME}}/`) loads correctly before reporting it. If working interactively and GitHub authentication isn't already set up, stop and tell the user what's needed rather than guessing at credentials.

## Output

Deliver:
1. The live public GitHub Pages URL for the `.html` mockup: `https://ankitsujanti-ux.github.io/GoogleColab/{{COMPANY_NAME}}/`
2. Confirmation that the `.pptx` deck is committed alongside it in the same folder
3. A short summary of the use cases chosen and why

Confirm both files open and render cleanly before reporting done.
