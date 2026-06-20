import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const PORT = process.env.PORT || 3001;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const clinicalPromptBase = `
You are VitalCheck, a careful health education assistant. You are NOT a clinician and cannot diagnose, treat, or replace medical care.
Generate an educational, personalized wellness report using the user's demographics and answers.
Always include this exact disclaimer in the response JSON summary or analysis: "This tool is for informational purposes only and is not a substitute for professional medical advice."
Use clear, cautious language and recommend professional evaluation for red flags, abnormal values, severe symptoms, pregnancy-related concerns, chest pain, trouble breathing, fainting, suicidal thoughts, or rapidly worsening symptoms.
Do not invent lab values or make diagnoses. If information is missing, state what would be useful to measure.
Cite 2-3 real peer-reviewed studies by title and year that are suitable for Google Scholar lookup. Prefer landmark or widely cited papers.
Return ONLY valid JSON with this exact shape:
{
  "score": "0-100 or concise label",
  "status": "Good | Needs Attention | At Risk | Urgent Review Suggested",
  "summary": "2-4 sentence status summary with the required disclaimer included or immediately adjacent.",
  "analysis": "A readable multi-paragraph report. Reference guideline organizations and clinical context.",
  "recommendations": ["specific action 1", "specific action 2", "specific action 3", "specific action 4", "specific action 5"],
  "sources": ["Guideline or organization source", "Peer-reviewed study title (year)", "Peer-reviewed study title (year)"]
}
`;

const areaPrompts = {
  lungs: `${clinicalPromptBase}
Focus area: Lungs.
Use guideline context from ATS/ERS respiratory assessment principles, CDC/FDA smoking cessation safety information, Global Initiative for Asthma/COPD concepts when relevant, and general exercise physiology.
Assess breathing efficiency, oxygen saturation context, smoking/vaping risk, exercise habits, symptom red flags, and practical breathing/cardio recommendations.`,

  heart: `${clinicalPromptBase}
Focus area: Heart.
Use guideline context from AHA/ACC cardiovascular prevention, AHA blood pressure categories, USPSTF preventive screening concepts, and FDA medication/supplement caution where relevant.
Assess blood pressure, cholesterol context, activity level, BMI context, family history, and cardiovascular risk. Encourage clinician follow-up for hypertension, chest pain, fainting, severe shortness of breath, or neurologic symptoms.`,

  nutrition: `${clinicalPromptBase}
Focus area: Nutrition.
Use guideline context from USDA Dietary Guidelines for Americans, FDA Daily Values/Nutrition Facts labeling, NIH Office of Dietary Supplements, and relevant clinical organizations when conditions are mentioned.
Assess nutrient gaps, supplement appropriateness, diet pattern, protein/fiber/micronutrient adequacy, safety risks from excessive dosing, and condition-specific food guidance.`,

  sleep: `${clinicalPromptBase}
Focus area: Sleep.
Use guideline context from the American Academy of Sleep Medicine (AASM), CDC sleep duration recommendations, and sleep apnea risk concepts.
Assess sleep duration, quality, insomnia/snoring/daytime sleepiness, caffeine/alcohol/screen timing, and sleep hygiene. Recommend medical evaluation for loud snoring with witnessed apneas, severe daytime sleepiness, or safety concerns.`,

  'muscles-joints': `${clinicalPromptBase}
Focus area: Muscles & Joints.
Use guideline context from ACSM physical activity and resistance training guidance, ACR/orthopedic red-flag concepts, and injury-prevention research.
Assess strength, mobility, pain areas, flexibility habits, sedentary behavior, and functional limitations. Recommend clinician/physical therapy evaluation for severe, traumatic, neurologic, swollen, hot, or progressive pain.`,

  'mental-wellness': `${clinicalPromptBase}
Focus area: Mental Wellness.
Use guideline context from APA stress management resources, USPSTF screening concepts, SAMHSA crisis guidance, and evidence-based mindfulness/exercise literature.
Assess stress, mood, coping habits, social support, sleep/energy/concentration, and safety red flags. If any self-harm risk is disclosed, advise immediate crisis/emergency support. Avoid diagnosis.`
};

function validatePayload(body) {
  if (!body || typeof body !== 'object') return 'Missing request body.';
  if (!body.area || !areaPrompts[body.area]) return 'Invalid health focus area.';
  if (!body.profile || typeof body.profile !== 'object') return 'Missing profile details.';
  if (!body.profile.age || !body.profile.biologicalSex) return 'Age and biological sex are required.';
  return null;
}

function buildUserPrompt({ area, profile, responses }) {
  return `
Health focus area: ${area}

Profile JSON:
${JSON.stringify(profile, null, 2)}

Area-specific responses JSON:
${JSON.stringify(responses || {}, null, 2)}

Instructions:
- Personalize the report to the user's entries.
- Include a health score or status summary.
- Include specific actionable recommendations. Include doses only for low-risk, generally accepted nutrition guidance when appropriate, and state that supplements/medications should be checked with a clinician/pharmacist, especially with pregnancy, medical conditions, or medications.
- Mention FDA/labeling or safety guidance where relevant and the requested clinical organization context.
- Include 2-3 real peer-reviewed study titles and years.
- Return only valid JSON. No markdown fences.`;
}

function safeParseReport(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Claude returned a response that could not be parsed as JSON.');
  }
}

app.post('/api/analyze', async (req, res) => {
  const validationError = validatePayload(req.body);
  if (validationError) return res.status(400).json({ error: validationError });
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY.' });
  }

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1800,
      temperature: 0.3,
      system: areaPrompts[req.body.area],
      messages: [
        { role: 'user', content: buildUserPrompt(req.body) }
      ]
    });

    const text = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    const report = safeParseReport(text);
    res.json({ report });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: 'Unable to generate report. Check your API key, model name, and server logs.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'VitalCheck' });
});

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`VitalCheck API running on http://localhost:${PORT}`));
}

export default app;
