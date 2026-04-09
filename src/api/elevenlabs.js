// ElevenLabs Text-to-Speech
// Uses "Rachel" voice by default — a clear, warm, professional voice well-suited
// for caregiver-facing clinical instructions.
// Voice IDs: https://api.elevenlabs.io/v1/voices
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel
const MODEL_ID = 'eleven_turbo_v2' // fast + high quality

export async function synthesizeSpeech(text, voiceId = DEFAULT_VOICE_ID) {
  const key = import.meta.env.VITE_ELEVENLABS_API_KEY
  if (!key) throw new Error('VITE_ELEVENLABS_API_KEY is not set. Add it to your .env file.')

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': key,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.detail?.message || `ElevenLabs error ${response.status}`)
  }

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export async function synthesizeLessonAudio(text) {
  const key = import.meta.env.VITE_ELEVENLABS_API_KEY
  if (!key) throw new Error('VITE_ELEVENLABS_API_KEY is not set. Add it to your .env file.')

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': key,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.80,
          style: 0.15,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.detail?.message || `ElevenLabs error ${response.status}`)
  }

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}
