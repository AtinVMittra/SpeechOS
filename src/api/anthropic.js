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

export async function generateLessonScript(patient) {
  const exerciseList = patient.exercises
    .map((ex, i) => `${i + 1}. "${ex.title}": ${ex.instruction}`)
    .join('\n')

  const flaggedNote = patient.flaggedExercises.length > 0
    ? `Flagged as challenging in recent sessions: ${patient.flaggedExercises.join(', ')}.`
    : ''

  const checkInNote = patient.lastCheckIn
    ? `At their last check-in (${patient.lastCheckIn.date}), they rated the session ${patient.lastCheckIn.rating}/5. Hard exercises: ${patient.lastCheckIn.hardExercises.join(', ') || 'none'}.`
    : ''

  const prompt = `You are a warm, encouraging virtual speech-language pathologist preparing a spoken lesson for a patient doing home practice.

Write a lesson script for ${patient.name}, age ${patient.age}, who has ${patient.condition}.
They are currently on a ${patient.streak}-day streak with ${patient.xp} XP earned.
${flaggedNote}
${checkInNote}

Today's exercises:
${exerciseList}

Return ONLY a valid JSON object with this exact structure — no markdown, no explanation:
{
  "patientName": "<first name only>",
  "greeting": "<1 warm sentence welcoming them>",
  "todaysFocus": "<1 sentence summarizing today's exercises by name>",
  "segments": [
    {
      "id": "intro",
      "speakerText": "<30-40 words: warm welcome, mention their streak if greater than 0, set a positive tone>",
      "displayTitle": "Welcome"
    },
    {
      "id": "exercise-1",
      "speakerText": "<40-60 words: name the exercise, explain it in plain language, add one word of encouragement>",
      "displayTitle": "Exercise 1: <exercise title>"
    },
    {
      "id": "tips",
      "speakerText": "<30-40 words: 2 practical tips for today based on their condition${flaggedNote ? ' and flagged exercises' : ''}>",
      "displayTitle": "Tips for Today"
    },
    {
      "id": "closing",
      "speakerText": "<20-30 words: motivating close, reference streak or XP if notable, invite them to begin>",
      "displayTitle": "Let's Begin"
    }
  ],
  "fullAudioScript": "<all speakerText fields concatenated in order, separated by a single space>",
  "estimatedDurationSeconds": <integer, estimate at 130 words per minute>
}

Important: include one "exercise-N" segment per exercise (exercise-1, exercise-2, etc.) between the intro and tips segments. Keep fullAudioScript under 4500 characters total.`

  const text = await callAnthropic(prompt, 1200)
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Could not parse lesson script from AI response.')

  const script = JSON.parse(match[0])
  if (!script.segments || !Array.isArray(script.segments)) {
    throw new Error('Invalid lesson script format returned.')
  }
  return script
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
