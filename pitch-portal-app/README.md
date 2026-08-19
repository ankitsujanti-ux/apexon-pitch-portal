# Pitch Portal App - Backend

This is the backend for the client pitch and mockup agent. All 5 steps in
`src/steps/` are now implemented, following `client-pitch-agent-prompt_1.md`:

1. `1-research.js` - researches the company/industry
2. `2-usecases.js` - brainstorms and picks the strongest use cases
3. `3-deck.js` - builds a .pptx pitch deck
4. `4-mockup.js` - builds a self-contained interactive HTML dashboard
5. `5-publish.js` - pushes the deck + mockup to GitHub Pages

Steps 1, 2, and 4 talk to an Azure AI Foundry agent (shared client in
`src/lib/azureAgentClient.js`) - the first call in a fresh session opens a
browser window to sign in, then reuses that login afterwards.

## Setup (first time only)

1. Install Node.js if you don't already have it: https://nodejs.org (LTS version)
2. In this folder, run:
   ```
   npm install
   ```
3. Make sure `.env` has real values for `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`
   (a GitHub personal access token with `repo` scope), and `GITHUB_REPO`.

## Run it

```
npm start
```

Then open http://localhost:3000/health in your browser.
You should see: `{"status":"ok","message":"Pitch portal backend is running"}`

Send a real request with something like:
```
curl -X POST http://localhost:3000/pitches \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Acme Retail","domain":"Retail","requirement":"exploring Microsoft Fabric and Real-Time Intelligence on Azure"}'
```

## Testing each step on its own

Each step has a standalone test script, same pattern as the original
`test-research.js`:

```
npm run test:research   # Step 1 only
npm run test:usecases   # Steps 1 + 2
npm run test:deck       # Steps 1 + 2 + 3, writes ./output/*.pptx
npm run test:mockup     # Steps 1 + 2 + 4, writes ./output/mockup-preview.html
npm run test:publish    # Step 5 only, with fake data - actually pushes to GitHub
```

`test:publish` really commits to your GitHub repo under a folder called
`test-company-zzz`, so it's safe to run without clashing with a real client.
