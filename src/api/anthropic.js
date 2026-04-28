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

  const prompt = `You are Victoria, a warm and upbeat virtual speech coach. You talk to patients like a friendly mentor — casual, encouraging, and genuinely excited for them. Avoid clinical jargon. Use natural spoken language with contractions, light enthusiasm, and personal touches.

Write a spoken lesson script for ${patient.name.split(' ')[0]}, age ${patient.age}, who is working on ${patient.condition}.
They are on a ${patient.streak}-day streak with ${patient.xp} XP earned.
${flaggedNote}
${checkInNote}

Today's exercises:
${exerciseList}

Return ONLY a valid JSON object with this exact structure — no markdown, no explanation:
{
  "patientName": "<first name only>",
  "greeting": "<1 upbeat sentence welcoming them by first name>",
  "todaysFocus": "<1 casual sentence summarizing today's exercises>",
  "segments": [
    {
      "id": "intro",
      "speakerText": "<30-40 words: friendly hey/hi greeting, celebrate their streak if > 0, set an excited tone — like a coach psyching them up>",
      "displayTitle": "Welcome"
    },
    {
      "id": "exercise-1",
      "speakerText": "<40-60 words: introduce the exercise by name in plain language, add a personal tip or fun encouragement>",
      "displayTitle": "Exercise 1: <exercise title>"
    },
    {
      "id": "tips",
      "speakerText": "<30-40 words: 2 practical tips in plain language based on their condition${flaggedNote ? ' and flagged exercises' : ''} — conversational, not clinical>",
      "displayTitle": "Tips for Today"
    },
    {
      "id": "closing",
      "speakerText": "<20-30 words: warm, excited send-off — reference streak or XP if notable, invite them to jump in>",
      "displayTitle": "Let's Go!"
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

export async function generateSessionPlan(patient, sessionFocus) {
  const prompt = `You are a pediatric speech-language pathologist creating a structured therapy session plan with interactive games for a ${patient.age}-year-old child.

Patient: ${patient.name}, age ${patient.age}
Condition: ${patient.condition}
Therapy Goal: ${patient.evaluationOutcome?.overarchingGoal || 'Not specified'}
Key Areas: ${patient.evaluationOutcome?.keyAreas?.join(', ') || 'Not specified'}
SLP's Session Focus: "${sessionFocus}"

Generate 3 exercises. Each exercise must be one of these three game types:
- "flashcard": drill individual words/sounds. Best for articulation practice, naming, vocabulary.
- "minimal-pairs": two words shown side by side, patient picks which one was said. Best for discrimination and phonological awareness.
- "word-sort": patient sorts words into 2 categories. Best for phonological patterns (e.g. initial vs. final position) or semantic categories.

Return ONLY valid JSON, no markdown:
{
  "sessionFocus": "<one sentence>",
  "totalDurationMinutes": 45,
  "blocks": [
    {"phase": "Warm-Up", "durationMinutes": 5, "activity": "<name>", "description": "<what to do>", "materials": "<materials>"},
    {"phase": "Targeted Drill", "durationMinutes": 15, "activity": "<name>", "description": "<what to do>", "materials": "<materials>"},
    {"phase": "Generalization Activity", "durationMinutes": 15, "activity": "<name>", "description": "<what to do>", "materials": "<materials>"},
    {"phase": "Wrap-Up", "durationMinutes": 10, "activity": "<name>", "description": "<what to do>", "materials": "<materials>"}
  ],
  "exercises": [
    {
      "id": "sp-ex-1",
      "gameType": "flashcard",
      "title": "<title>",
      "instructions": "<brief therapist instructions>",
      "targetTrials": <number 8-15>,
      "targetAccuracy": "<e.g. 80%>",
      "ageNote": "<why this suits a ${patient.age}-year-old>",
      "cards": [
        {"word": "<word>", "emoji": "<single relevant emoji>", "targetSound": "<e.g. /s/ initial>", "hint": "<short pronunciation hint>"}
      ]
    },
    {
      "id": "sp-ex-2",
      "gameType": "minimal-pairs",
      "title": "<title>",
      "instructions": "<brief therapist instructions>",
      "targetTrials": <number 6-10>,
      "targetAccuracy": "<e.g. 75%>",
      "ageNote": "<why this suits a ${patient.age}-year-old>",
      "pairs": [
        {"target": "<target word>", "foil": "<minimally different word>", "targetSound": "<contrast being trained>"}
      ]
    },
    {
      "id": "sp-ex-3",
      "gameType": "word-sort",
      "title": "<title>",
      "instructions": "<brief therapist instructions>",
      "targetTrials": <total number of words>,
      "targetAccuracy": "<e.g. 80%>",
      "ageNote": "<why this suits a ${patient.age}-year-old>",
      "categories": ["<Category A>", "<Category B>"],
      "words": [
        {"word": "<word>", "category": "<Category A or B>"}
      ]
    }
  ]
}

Rules:
- flashcard: include 8–12 cards with age-appropriate words and relevant emojis
- minimal-pairs: include 6–8 pairs where the contrast targets the therapy goal
- word-sort: include 10–14 words split roughly equally across the 2 categories
- Make games directly relevant to the patient's specific therapy goal and condition`

  const text = await callAnthropic(prompt, 2000)
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Could not parse session plan from AI response.')
  const plan = JSON.parse(match[0])
  return { ...plan, id: `plan-${Date.now()}`, createdAt: new Date().toISOString(), patientId: patient.id }
}

export async function structureScribeOutput(transcript, patient) {
  const prompt = `You are a clinical documentation AI helping a pediatric speech-language pathologist write a SOAP note from a session transcript.

Patient: ${patient.name}, age ${patient.age}
Condition: ${patient.condition}
Therapy Goal: ${patient.evaluationOutcome?.overarchingGoal || 'Not specified'}

Session Transcript:
"${transcript}"

Generate a structured SOAP note. Return ONLY valid JSON, no markdown:
{
  "subjective": "<Patient/parent reported information — what the child or parent said about progress, difficulties, mood, homework completion. 2–3 sentences.>",
  "objective": "<Measurable clinical observations — specific trials attempted, accuracy percentages, error types, cueing levels used. 3–4 sentences with numbers.>",
  "assessment": "<Clinical interpretation — progress toward goal, patterns noted, factors affecting performance. 2–3 sentences.>",
  "plan": "<Next session focus, homework assigned, any referrals or parent coaching notes. 2–3 sentences.>"
}

Use standard pediatric SLP clinical language. Be specific and measurable in the Objective section.`

  const text = await callAnthropic(prompt, 800)
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Could not parse SOAP note from AI response.')
  return JSON.parse(match[0])
}

export async function generateBonusExercises(patient, completedExerciseTitles) {
  const prompt = `You are Victoria, a friendly speech coach. A patient just finished their main practice session and wants to keep going — great news! Generate 3 short bonus exercises that build on what they just practiced.

Patient: ${patient.name.split(' ')[0]}, age ${patient.age}
Condition: ${patient.condition}
Just completed: ${completedExerciseTitles.join(', ')}

Return ONLY a valid JSON array — no markdown, no explanation:
[
  {
    "title": "<Short fun title, max 5 words>",
    "type": "exercise",
    "instruction": "<Friendly, plain-language instruction for independent practice. 1-2 sentences. No clinical terms.>"
  },
  {
    "title": "<Short fun title>",
    "type": "quiz",
    "instruction": "<Encourage them to say the target word clearly and confidently.>",
    "targetWord": "<single target word relevant to their therapy goal>"
  },
  {
    "title": "<Short fun title>",
    "type": "exercise",
    "instruction": "<Friendly instruction. 1-2 sentences.>"
  }
]

Rules:
- Age-appropriate for a ${patient.age}-year-old
- Build directly on the completed exercises — same sounds/words, slightly different approach
- Keep language encouraging and casual — like a coach, not a clinician
- For quiz type, pick an achievable single word that targets their therapy goal`

  const text = await callAnthropic(prompt, 600)
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('Could not parse bonus exercises from AI response.')

  const exercises = JSON.parse(match[0])
  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw new Error('Invalid bonus exercise format returned.')
  }

  return exercises.slice(0, 3).map((ex, i) => ({
    id: `bonus-${Date.now()}-${i}`,
    title: ex.title || `Bonus ${i + 1}`,
    type: ex.type || 'exercise',
    instruction: ex.instruction || '',
    ...(ex.targetWord ? { targetWord: ex.targetWord } : {}),
    bonus: true,
  }))
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
