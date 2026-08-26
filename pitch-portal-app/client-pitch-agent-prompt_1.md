# Client Pitch & Mockup Agent — Prompt Template

This file is the spec for what we send Azure AI Foundry `DemoAgent` on each run.
We do **not** change the agent definition in Azure. `1-research.js` and `2-usecases.js` send these instructions as the user prompt (including the brief-first rule from `src/lib/briefFirst.js`). The PPT and HTML builders then lay that copy out on Apexon brand chrome.

## Inputs (from the landing screen)

- **Company name:** `{{COMPANY_NAME}}`
- **Domain / industry:** `{{DOMAIN}}`
- **Requirement:** `{{REQUIREMENT}}`
- **Use cases:** 3–7, decided from the brief
- **Mockup:** one leadership HTML screen covering the KPIs from those use cases. Not a tab per use case.

---

## Core rule (permanent)

**Requirement first, reference second.** Shared PPTs, HTML, screenshots, and other materials are **reference only**. They set expected quality and depth. Do **not** copy their content, layout, tabs, charts, architecture, technology, terminology, or visual style unless the **current requirement** explicitly asks for them.

Apexon navy, orange, and the white lockup are brand chrome. They are not content.

### Required workflow

1. Understand the business problem first.
2. Brainstorm the most appropriate story, visuals, and UI for this company and mandate.
3. Independently decide how the PPT should tell the story, and how ONE leadership HTML screen should look.
4. Generate new business-specific content.
5. Design the PPT and HTML around that content.

There is no fixed template, chart menu, or tab structure. Do not repeat the same KPI strip or architecture because a reference used them.

The HTML is one leadership product screen. The PPT tells each use case. Invent both at runtime from this company and this mandate.

Every screen must make **what it shows**, **why it matters**, and **what action it enables** obvious from the UI. Name a product, platform, or vendor only if `{{REQUIREMENT}}` names it. Otherwise describe the capability in plain words. Logos follow the same rule.

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
{"summary":"","operationsWalk":"","leadershipMorning":"","verifiedFacts":[{"fact":"","basis":""}],"systems":[{"name":"","role":"","confidence":"confirmed|industry-typical","basis":""}],"reporting":[{"name":"","confidence":"confirmed|industry-typical","basis":""}],"compliance":[""],"requirementFit":""}
```

Rules:

- Search public sources first: official site, filings, reputable news. Then separate confirmed from industry-typical.
- `summary`: 2 short sentences a business stakeholder would nod at. Public, checkable facts only.
- `operationsWalk`: 4–6 sentences on how THIS company actually works, in `{{DOMAIN}}` language.
- `leadershipMorning`: 2–3 sentences on what a VP would want on one screen at the start of the day. Name the metric, then say what it means.
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
| 3. Select | Score on recognisable / mandateFit / demoable / dataLikely, pick 3–7 (tight mandate → 3, sprawling → 6–7), record why each rejected one lost |
| 4. Draft | Write the full pitch content for the survivors |
| 4b. Design | Invent ONE leadership HTML hub (`hub.screenHtml` + KPIs from the use cases) and each slide (`slide.regions`). Neighbouring slides must differ. |
| 5. Critique | Hostile review: find LABEL, GENERIC, UNSUPPORTED, INVENTED, SO_WHAT, REPEAT, SAMEY, SPARSE, HUB defects by field |
| 6. Revise | Fix those specific defects, keep what was not criticised |
| 7. Verify | Label every load-bearing claim `confirmed` or `industry-typical` with its basis |

Each pass degrades gracefully: an unparseable pass is skipped and the previous state carries forward, so one bad response cannot fail the whole generation. Progress is reported per pass to the portal.

**Verification stance.** Nothing is presented as fact unless labelled `confirmed`. Claims about a company's internal systems are not public, so the honest output is `industry-typical` with the basis shown on the slide and screen. Never upgrade a label to make the deck look stronger.

### Content instructions (sent in the draft pass)

Walk their plant, store, claims desk, or trading floor in your head. Internally list 8–10 candidate use cases a `{{COMPANY_NAME}}` operator would recognize as **their job**. Then keep 3–7 — whatever this brief actually needs. A tight mandate is 3. A sprawling operation is 6 or 7. Prefer fewer that a leader would remember.

Keep ones that:

1. Map to how `{{COMPANY_NAME}}` actually makes money, ships product, serves customers, or stays compliant.
2. Are normal and valuable in `{{DOMAIN}}` — a plant manager / merchandiser / claims lead would say “that is us.”
3. Can be shown in a short demo without inventing systems they do not have.
4. Address `{{REQUIREMENT}}` — not a different mandate from a reference deck.

Reject anything that could be pasted onto another industry unchanged. Reject textbook titles like “data lake” or “customer 360” unless they name the actual `{{COMPANY_NAME}}` process.

Copy must be **slide-ready**, not an essay. A VP should read a card in 5 seconds.

Also design:

- The **title-slide** copy (`deckKicker`, `deckTitle`, `deckSubtitle`, `closeLine`) from this brief.
- The **architecture** for this requirement (`architecture.sources`, `stages`, `target`, `guards`). Name the stages after this company's actual process. Do not reuse a generic phase model.
- ONE **leadership HTML hub** (`hub.title`, `hub.whatItShows`, `hub.kpis` from the use cases, `hub.screenHtml`). Leave per-use-case `screenHtml` empty. There is no tab tour.
- Each **slide composition** in `slide.regions` (kinds `quote`, `list`, `pair`, `steps`, `kpis`, `callout`, `split`, `compare`; spans 4, 6, or 12). Neighbouring slides must differ. `slideLayout` remains a fallback.

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

Every use-case slide showing challenge + moves + works-with + value + 4 KPIs + data + effort is what makes all the slides look identical and unreadable. So describe a composition in `slide.regions` that fits THIS use case's one idea. Neighbouring slides must not share the same kind sequence. `slideLayout` is only a fallback if regions are missing.

| `kind` | Use when | Span |
| --- | --- | --- |
| `quote` | one statement is the point | 12 |
| `kpis` | the numbers are the point | 12 |
| `compare` / `split` | today vs after | 12 or 6+6 |
| `steps` | the story is a path | 12 |
| `list` | a few outcomes | 6 or 12 |
| `pair` | a labelled card | 6 |
| `callout` | a caution or constraint | 6 or 12 |

Each layout renders only **part** of the content so the slide stays readable. Write every field anyway — the builder picks what that layout needs.

### The HTML is the product, not the deck

The mockup shows the working software. Do **not** restate the challenge or the business case there — that is the deck's job, and repeating it makes the screen unreadable. The leadership screen gets one short caption (`hub.whatItShows`) and the visual.

Write `hub.screenHtml` as real markup for that one working view. Allowed tags: `article, section, div, h3, h4, p, span, b, small, ul, ol, li, table, thead, tbody, tr, th, td, button`. Allowed classes are the design system: `row`, `stack`, `viz`, `heat`, `board`, `funnel`, `queue`, `compare`, `timeline`, `gauge`, `callout`, and the rest listed in `src/lib/designContract.js`. `blocks` is a fallback if the markup is rejected. Leave `useCases[].screenHtml` empty.

Return JSON only, 3–7 use cases:

```json
{"deckKicker":"","deckTitle":"","deckSubtitle":"","closeLine":"","architecture":{"title":"","subtitle":"","sources":[{"name":""}],"stages":[{"title":"","steps":[""]}],"target":{"name":"","components":[""]},"guards":[{"n":"","title":"","body":""}]},"useCases":[{"title":"","subtitle":"","challenge":"","businessProblem":"","benefit":"","solutionFit":"","solutionMoves":[{"lead":"","detail":""}],"worksWith":[""],"businessValue":[""],"proofPoint":"","whatItShows":"","whyItMatters":"","action":"","lookFirst":"","blocks":["table"],"columns":[],"zones":[],"entities":[],"steps":[],"recordKind":"","slideLayout":"challenge|impact|shift|journey|evidence","screenHtml":"","slide":{"idea":"","regions":[{"kind":"quote|list|pair|steps|kpis|callout|split|compare","span":12,"kicker":"","title":"","body":"","items":[""],"accent":""}]},"kpis":[{"name":"","why":""}],"dataPointer":{"description":"","availability":"existing|new","confidence":"confirmed|industry-typical"},"difficulty":"easier|moderate|harder","difficultyWhy":"","techComponents":[],"demoScore":9}],"overallBenefits":["","","",""],"hub":{"title":"","subtitle":"","whatItShows":"","screenHtml":"","kpis":[{"name":"","value":"","why":"","from":""}]}}
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
- `whatItShows`: 12–22 words, **one** sentence — used on the slide; the HTML caption is `hub.whatItShows`. `whyItMatters` / `action`: 12–22 words each.
- `hub.screenHtml`: real markup for the one leadership working view. Leave per-use-case `screenHtml` empty.
- `slide.regions`: 1–4 regions. Neighbouring slides must not share a kind sequence.
- `businessProblem`: 25–40 words. `benefit`: 20–35 words.
- `proofPoint`: one sentence of industry evidence, or `""` if not confident.
- `title`: max 9 words. `subtitle`: 6–12 words — the promise of this use case.
- `deckKicker`: max 4 words. `deckTitle`: max 9 words. `deckSubtitle`: max 18 words. `closeLine`: max 18 words.
- `architecture.stages`: 2–3 stages, each 2–6 short steps, named for this process.
- `architecture.target`: the platform this requirement asked for, by name. If it names none, use `"Operating platform"` — do not pick one for them.
- `architecture.guards`: 0–4 cards. Omit if this brief is not about governance.
- `lookFirst`: max 8 words.
- `blocks`: 1–3 of `kpis`, `bars`, `alerts`, `table`, `heat`, `record`, `actions`, `flow`, `compare`, `timeline`, `entities`. Hub fallback only.
- `hub.kpis`: one KPI per use case (sample value, never claimed live).
- `overallBenefits`: exactly 4 lines, 12–20 words each.
- `techComponents`: max 3 names from this mandate.

---

## Step 3 — Pitch deck (built in code)

Narrative structure (title → agenda → architecture → use cases → thank you) is the **delivery format**. Content is generated from this brief. Slide count is `4 + N` where N is 3–7.

Every use-case slide carries a common header (index, title, subtitle, accent rule) and a one-line evidence strip. The body is packed from `slide.regions` onto a 12-column grid. If regions are missing, `slideLayout` is the fallback. Neighbouring slides must not share one composition.

Aim for roughly 150 words of body copy per slide. If a layout feels full, cut copy rather than shrinking type.

## Step 4 — Interactive HTML (built in code)

The **only** thing carried over from anything shared previously is the dark theme: navy canvas, orange accent, white Apexon lockup. Everything else — composition, visuals, wording, iconography — is designed fresh for this requirement.

- Dark navy canvas. One leadership screen, not a tab per use case. Fits the viewport, no page scroll.
- One type scale for the whole page. No ad-hoc font sizes.
- This is the **product**, not the deck. KPI strip from the use cases. One short caption (`hub.whatItShows`), then the working view. No challenge, no business case, no “what is verified” block — those live in the PPT.
- The agent writes `hub.screenHtml`. A sanitizer keeps only the design-system tags and classes. If the markup is rejected, `blocks` paints a fallback.
- Sample data is simulated, never claimed as live company metrics.

---

## Do not

- Change the Azure Foundry `DemoAgent` definition. Prompts in this repo are the permanent instructions.
- Publish generated PPT/HTML to GitHub Pages. The portal downloads files only.
- Invent company facts, metrics, or systems.
- Carry any screen, diagram, phase model, or wording from a previous brief into this one. The dark theme is the only thing that persists.
- Name a product, platform, or vendor that `{{REQUIREMENT}}` does not name.
- Write long paragraphs that will overflow a slide.
- Put the same composition on neighbouring use-case slides.
- Repeat the deck's business case inside the HTML mockup.
