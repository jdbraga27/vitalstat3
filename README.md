# VitalCheck

VitalCheck is a full-stack health calculator web app. Users choose a health focus area, enter general profile details and area-specific answers, then receive an AI-generated educational health report using Claude through a secure Express backend.

> Medical disclaimer: This tool is for informational purposes only and is not a substitute for professional medical advice.

## Tech stack

- React + Vite frontend
- Node.js + Express backend
- Anthropic Claude Messages API through `@anthropic-ai/sdk`
- Deploy-ready for Vercel

## Health areas

- Lungs
- Heart
- Nutrition
- Sleep
- Muscles & Joints
- Mental Wellness

Each area has its own frontend form and backend system prompt tuned to organizations such as FDA, AHA, ATS, AASM, USDA, APA, and ACSM.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

3. Open `.env` and add your Anthropic API key:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-real-key
CLAUDE_MODEL=claude-sonnet-4-6
VITE_API_BASE_URL=http://localhost:3001
```

4. Run the app locally:

```bash
npm run dev
```

5. Preview in your browser:

```text
http://localhost:5173
```

The Vite frontend will call the Express backend at `http://localhost:3001/api/analyze`.

## Deploying to Vercel

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. In Vercel, go to **Project Settings → Environment Variables**.
4. Add:

```text
ANTHROPIC_API_KEY = your Anthropic API key
CLAUDE_MODEL = claude-sonnet-4-6
```

5. Deploy.

For Vercel production, you usually do not need `VITE_API_BASE_URL` because the frontend calls `/api/analyze` on the same domain.

## Security notes

- Never put `ANTHROPIC_API_KEY` in frontend code.
- The API key is read only on the server from `process.env.ANTHROPIC_API_KEY`.
- `.env` is included in `.gitignore` and should not be committed.

## Important clinical limitations

VitalCheck is educational software. It does not diagnose, treat, or replace licensed medical care. The backend prompts instruct Claude to recommend professional or emergency evaluation for red-flag symptoms and to avoid making diagnoses.

## Optional naming alternatives

If you want a name that sounds slightly more polished than VitalCheck, consider:

- VitaWise
- WellScope
- HealthLens
- ClearVitals
- WellSignal

VitalCheck is still clear, memorable, and directly communicates the app's purpose.
