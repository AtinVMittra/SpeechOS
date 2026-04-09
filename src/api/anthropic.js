const MODEL = 'claude-sonnet-4-0'

// In dev, call Anthropic directly (requires VITE_ANTHROPIC_API_KEY + browser flag).
// In production, call the local proxy server which holds the key server-side.
const IS_DEV = import.meta.env.DEV
const API_URL = IS_DEV ? 'https://api.anthropic.com/v1/messages' : '/api/anthropic'

async function callAnthropic(prompt, maxTokens = 512) {
  const headers = { 'Content-Type': 'application/json' }

  if (IS_DEV) {
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!key) throw new Error('VITE_ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.')
    headers['x-api-key'] = key
    headers['anthropic-version'] = '2023-06-01'
    headers['anthropic-dangerous-allow-browser'] = 'true'
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

export async function generatePatientBrief(patient) {
  const prompt = `You are a clinical AI assistant helping a speech-language pathologist (SLP) prepare for a patient session. Based on the patient data below, write a concise 2–3 sentence pre-session brief. Focus on the most clinically relevant trends, what to prioritize today, and any caregiver dynamics worth noting. Write in a professional but warm clinical tone.

Patient: ${patient.name}, age ${patient.age}
Condition: ${patient.condition}
Weekly home practice compliance: ${patient.compliance}%
Current streak: ${patient.streak} day(s)
Voice samples recorded: ${patient.voiceSamples}
Exercises flagged as hard: ${patient.flaggedExercises.join(', ')}
Most recent session notes: "${patient.sessionNotes}"${patient.lastCheckIn ? `
Last check-in (${patient.lastCheckIn.date}): Patient rated the session ${patient.lastCheckIn.rating}/5. Hard exercises reported: ${patient.lastCheckIn.hardExercises.join(', ') || 'none'}. Patient questions: ${patient.lastCheckIn.questions?.join('; ') || 'none'}. Topics they want to explore: ${patient.lastCheckIn.topicsToExplore || 'none'}.` : ''}

Write only the brief — no headers, no bullet points, no preamble.`

  return callAnthropic(prompt, 256)
}

export async function generateExercisePlan(sessionNote) {
  const prompt = `You are a speech-language pathologist creating a structured home practice plan. Based on the session note below, generate exactly 3 daily exercises for the patient's caregiver to complete at home between sessions.

Return your response as a valid JSON array with exactly this structure — no markdown, no explanation, just the raw JSON array:
[
  {
    "title": "Short exercise title (max 5 words)",
    "instruction": "Clear, caregiver-friendly instruction in 1–2 sentences. Use plain language a parent or family member can follow without clinical training."
  },
  {
    "title": "...",
    "instruction": "..."
  },
  {
    "title": "...",
    "instruction": "..."
  }
]

Session note:
"${sessionNote}"

Output only the JSON array.`

  const text = await callAnthropic(prompt, 600)

  // Extract JSON array from response
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('Could not parse exercises from AI response.')

  const exercises = JSON.parse(match[0])
  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw new Error('Invalid exercise format returned.')
  }

  return exercises.slice(0, 3).map((ex, i) => ({
    id: `gen-${Date.now()}-${i}`,
    title: ex.title || `Exercise ${i + 1}`,
    instruction: ex.instruction || '',
  }))
}
