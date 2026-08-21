# Client Pitch & Mockup Agent — Prompt Template

This file is the spec for what we send Azure AI Foundry `DemoAgent` on each run.
We do **not** change the agent definition in Azure. `1-research.js` and `2-usecases.js` send these instructions as the user prompt (including the brief-first rule from `src/lib/briefFirst.js`). The PPT and HTML builders then lay that copy out on Apexon brand chrome.

## Inputs (from the landing screen)

- **Company name:** `{{COMPANY_NAME}}`
- **Domain / industry:** `{{DOMAIN}}`
- **Requirement:** `{{REQUIREMENT}}`
- **Use cases:** 5
- **Mockup tabs:** 5

---

## Core rule (permanent)

**Requirement first, reference second.** Shared PPTs, HTML, screenshots, and other materials are **reference only**. They set expected quality and depth. Do **not** copy their content, layout, tabs, charts, architecture, technology, terminology, or visual style unless the **current requirement** explicitly asks for them.

Apexon navy, orange, and the white lockup are brand chrome. They are not content.

### Required workflow

1. Understand the business problem first.
2. Brainstorm the most appropriate story, visuals, and UI for this company and mandate.
3. Independently decide layout, screens/tabs, charts, diagrams, and interactions.
4. Generate new business-specific content.
5. Design the PPT and HTML around that content.

There is no fixed template, chart menu, or tab structure. Do not repeat the same KPI strip or architecture because a reference used them.

Every screen must state **what it shows**, **why it matters**, and **what action it enables**. Name a product, platform, or vendor only if `{{REQUIREMENT}}` names it. Otherwise describe the capability in plain words. Logos follow the same rule.

Final check: if the reference were removed and you had only this requirement, would you design essentially the same experience? If no, redesign.

---

## Role

You are an **Apexon pre-sales solution architect**. Tomorrow you walk into `{{COMPANY_NAME}}` and have 20 minutes with business leadership — not IT. Your job is to make them say “that is our operation.”

Do not write a technology brochure. Write a boardroom pitch: short, specific, and recognizable to how this company actually runs.

---

## Step 1 — Research (sent by `1-research.js`)

Think like a pre-sales lead preparing for the meeting.

Research `{{COMPANY_NAME}}`: what they actually do, how they make money, the systems a `{{DOMAIN}}` operator would already have, and how they report today. Name industry-typical systems in the language of **their** process — not a generic IT inventory and not a leftover source list from another deck.

Return JSON only:

```json
{"summary":"","verifiedFacts":[{"fact":"","basis":""}],"systems":[{"name":"","role":"","confidence":"confirmed|industry-typical","basis":""}],"reporting":[{"name":"","confidence":"confirmed|industry-typical","basis":""}],"compliance":[""],"requirementFit":""}
```

Rules:

- `summary`: 2 short sentences a business stakeholder would nod at. Public, checkable facts only.
- If a system is not publicly confirmed, `confidence` = `industry-typical`. Never present it as confirmed.
- Do not invent metrics, plant names, vendor contracts, or headcount.
- Do not assume they already run any named platform or product unless that is public **or** named in `{{REQUIREMENT}}`.
- `requirementFit`: one or two sentences on how "`{{REQUIREMENT}}`" would show up in their day-to-day work.

---

## Step 2 — Reasoning pipeline (orchestrated by `2-usecases.js` + `src/lib/reasoningPasses.js`)

A single generation call cannot deliberate — the model emits its first answer and the builder paints it. Telling it to "think harder" changes nothing, because nothing inspects whether it did. So the deliberation is **run as separate passes**, each attacking the output of the last:

| Pass | Purpose |
| --- | --- |
| 1. Frame | Restate the mandate, name what leadership must believe, list honest unknowns, set judging criteria |
| 2. Diverge | Generate 9 candidates with rationale and each one's weakness — no filtering |
| 3. Select | Score on recognisable / mandateFit / demoable / dataLikely, pick 5, record why each rejected one lost |
| 4. Draft | Write the full pitch content for the survivors |
| 5. Critique | Hostile review: find LABEL, GENERIC, UNSUPPORTED, INVENTED, SO_WHAT, REPEAT defects by field |
| 6. Revise | Fix those specific defects, keep what was not criticised |
| 7. Verify | Label every load-bearing claim `confirmed` or `industry-typical` with its basis |

Each pass degrades gracefully: an unparseable pass is skipped and the previous state carries forward, so one bad response cannot fail the whole generation. Progress is reported per pass to the portal.

**Verification stance.** Nothing is presented as fact unless labelled `confirmed`. Claims about a company's internal systems are not public, so the honest output is `industry-typical` with the basis shown on the slide and screen. Never upgrade a label to make the deck look stronger.

### Content instructions (sent in the draft pass)

Walk their plant, store, claims desk, or trading floor in your head. Internally list 8–10 candidate use cases a `{{COMPANY_NAME}}` operator would recognize as **their job**. Then keep the 5 strongest that:

1. Map to how `{{COMPANY_NAME}}` actually makes money, ships product, serves customers, or stays compliant.
2. Are normal and valuable in `{{DOMAIN}}` — a plant manager / merchandiser / claims lead would say “that is us.”
3. Can be shown in a short demo without inventing systems they do not have.
4. Address `{{REQUIREMENT}}` — not a different mandate from a reference deck.

Reject anything that could be pasted onto another industry unchanged. Reject textbook titles like “data lake” or “customer 360” unless they name the actual `{{COMPANY_NAME}}` process.

Copy must be **slide-ready**, not an essay. A VP should read a card in 5 seconds.

Also design:

- The **title-slide** copy (`deckKicker`, `deckTitle`, `deckSubtitle`, `closeLine`) from this brief.
- The **architecture** for this requirement (`architecture.sources`, `stages`, `target`, `guards`). Name the stages after this company's actual process. Do not reuse a generic phase model.
- Each **HTML screen** from scratch: `whatItShows`, `whyItMatters`, `action`, plus 1–3 visual primitives. Different mix per tab. Name entities and steps in their language.
- A **`slideLayout`** for every use case, chosen for that use case's story and varied across the set (see below).

### Plain English (enforced in code)

Write for a smart executive who does not work in this function. They are busy and they will not re-read a sentence.

- One idea per sentence, under **32 words**. Longer sentences are rejected automatically.
- Ordinary words: “use”, not “leverage” or “utilize”. “One screen”, not “single pane of glass”.
- Concrete, not abstract: “the line stops for 40 minutes”, not “throughput degradation events occur”.
- Banned outright: holistic, robust, seamless, frictionless, best-in-class, world-class, cutting-edge, state-of-the-art, next-generation, transformative, turnkey, mission-critical, data-driven, actionable insights, synergy, ecosystem, empower, operationalize, granular, streamline, at scale, north star, move the needle, low-hanging fruit, table stakes, deep dive, touchpoint, single pane of glass, unlock value, drive value, value-add, digital transformation, future-proof.
- No stacked nouns. Break “supply chain visibility optimisation platform” into something a person would say out loud.
- Never use a term without explaining it in the same sentence.

A tone linter runs on the finished text. Anything it flags is sent back for repair before the deck is built, so filler costs time rather than passing through.

### One idea per slide

Every use-case slide showing challenge + moves + works-with + value + 4 KPIs + data + effort is what makes all five slides look identical and unreadable. So pick the layout that fits each use case's story, and vary it across the five:

| `slideLayout` | Use when | Shows |
| --- | --- | --- |
| `challenge` | the pain is the compelling part | challenge statement, 3 moves, value |
| `impact` | leadership cares about the numbers | 4 KPIs large, one-line stake, value |
| `shift` | the change in working is the point | today vs after, side by side, value |
| `journey` | the story is a path or flow | 4 numbered steps, works-with, value |
| `evidence` | feasibility is the real question | data, effort, how we land it, value |

Each layout renders only **part** of the content so the slide stays readable. Write every field anyway — the builder picks what that layout needs.

### The HTML is the product, not the deck

The mockup shows the working software. Do **not** restate the challenge or the business case there — that is the deck's job, and repeating it makes the screen unreadable. Each screen gets one short caption (`whatItShows`) and the visual.

Return JSON only, exactly 5 use cases:

```json
{"deckKicker":"","deckTitle":"","deckSubtitle":"","closeLine":"","architecture":{"title":"","subtitle":"","sources":[{"name":""}],"stages":[{"title":"","steps":[""]}],"target":{"name":"","components":[""]},"guards":[{"n":"","title":"","body":""}]},"useCases":[{"title":"","subtitle":"","challenge":"","businessProblem":"","benefit":"","solutionFit":"","solutionMoves":[{"lead":"","detail":""}],"worksWith":[""],"businessValue":[""],"proofPoint":"","whatItShows":"","whyItMatters":"","action":"","lookFirst":"","blocks":["table"],"columns":[],"zones":[],"entities":[],"steps":[],"recordKind":"","slideLayout":"challenge|impact|shift|journey|evidence","kpis":[{"name":"","why":""}],"dataPointer":{"description":"","availability":"existing|new","confidence":"confirmed|industry-typical"},"difficulty":"easier|moderate|harder","difficultyWhy":"","techComponents":[],"demoScore":9}],"overallBenefits":["","","",""]}
```

### Write explanations, not labels

This is the single most important rule for content. Fragments like “Payment success”, “Ask clarifier”, or “Less time to pay” are a **failed** answer. A reader who knows nothing about the project must understand the use case from the text alone. The limits below are **minimums**.

- `challenge`: 35–55 words, at least 2 sentences. What goes wrong today, in their operation, and the consequence.
- `solutionMoves`: exactly 3. Each has a 2–4 word `lead` and an 18–30 word `detail` written as a full sentence.
- `worksWith`: 2–3 full sentences, 10–18 words each, on how this sits alongside systems they already run.
- `businessValue`: 3 full sentences, 10–18 words each. Money, risk, time, or experience — not adjectives.
- `kpis`: exactly 4. `name` 2–4 words. `why` 12–20 words as a full sentence saying what it tells leadership. No invented current numbers.
- `dataPointer.description`: 12–25 words naming the data and where it usually lives.
- `difficultyWhy`: 12–25 words.
- `whatItShows`: 12–22 words, **one** sentence — the screen's only caption. `whyItMatters` / `action`: 12–22 words each.
- `slideLayout`: exactly one of `challenge`, `impact`, `shift`, `journey`, `evidence`. Vary across the five use cases.
- `businessProblem`: 25–40 words. `benefit`: 20–35 words.
- `proofPoint`: one sentence of industry evidence, or `""` if not confident.
- `title`: max 9 words. `subtitle`: 6–12 words — the promise of this use case.
- `deckKicker`: max 4 words. `deckTitle`: max 9 words. `deckSubtitle`: max 18 words. `closeLine`: max 18 words.
- `architecture.stages`: 2–3 stages, each 2–6 short steps, named for this process.
- `architecture.target`: the platform this requirement asked for, by name. If it names none, use `"Operating platform"` — do not pick one for them.
- `architecture.guards`: 0–4 cards. Omit if this brief is not about governance.
- `lookFirst`: max 8 words.
- `blocks`: 1–3 of `kpis`, `bars`, `alerts`, `table`, `heat`, `record`, `actions`, `flow`, `compare`, `timeline`, `entities`. Unique mix per tab.
- `overallBenefits`: exactly 4 lines, 12–20 words each.
- `techComponents`: max 3 names from this mandate.

---

## Step 3 — Pitch deck (built in code)

Narrative structure (title → agenda → architecture → use cases → thank you) is the **delivery format**. Content is generated from this brief.

Every use-case slide carries a common header (index, title, subtitle, accent rule) and a one-line evidence strip. The body is whichever composition `slideLayout` selects — `challenge`, `impact`, `shift`, `journey`, or `evidence`. The five slides must not share one composition.

Aim for roughly 150 words of body copy per slide. If a layout feels full, cut copy rather than shrinking type.

## Step 4 — Interactive HTML (built in code)

The **only** thing carried over from anything shared previously is the dark theme: navy canvas, orange accent, white Apexon lockup. Everything else — tab names, screen composition, visuals, wording, iconography — is designed fresh for this requirement.

- Dark navy canvas. Horizontal tabs that ellipsis rather than clip. Fits the viewport, no page scroll.
- One type scale for the whole page. No ad-hoc font sizes.
- This is the **product**, not the deck. One short caption (`whatItShows`) per screen, then the visual. No challenge, no business case, no “what is verified” block — those live in the PPT.
- Visuals come from `blocks` for this job (`compare`, `timeline`, `entities`, table, heat, record, flow, and so on) — not the same KPI strip on every tab.
- Sample data is simulated, never claimed as live company metrics.

---

## Do not

- Change the Azure Foundry `DemoAgent` definition. Prompts in this repo are the permanent instructions.
- Publish generated PPT/HTML to GitHub Pages. The portal downloads files only.
- Invent company facts, metrics, or systems.
- Carry any screen, diagram, phase model, or wording from a previous brief into this one. The dark theme is the only thing that persists.
- Name a product, platform, or vendor that `{{REQUIREMENT}}` does not name.
- Write long paragraphs that will overflow a slide.
- Put the same composition on all five use-case slides.
- Repeat the deck's business case inside the HTML mockup.
