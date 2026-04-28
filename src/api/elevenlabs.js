// ElevenLabs Text-to-Speech
// Uses "Victoria" voice — warm, expressive, and natural-sounding for patient-facing lessons.
// Voice IDs: https://api.elevenlabs.io/v1/voices
const VICTORIA_VOICE_ID = 'TX3LPaxmHKxFdv7VOQHJ' // Victoria
const MODEL_ID = 'eleven_multilingual_v2' // richer expressiveness vs turbo

export async function synthesizeSpeech(text, voiceId = VICTORIA_VOICE_ID) {
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
          stability: 0.45,
          similarity_boost: 0.80,
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
    `https://api.elevenlabs.io/v1/text-to-speech/${VICTORIA_VOICE_ID}`,
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
          stability: 0.40,       // lower = more natural variation in delivery
          similarity_boost: 0.85,
          style: 0.20,           // slight expressiveness boost for lesson narration
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
