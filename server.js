import express from 'express'
import { createServer } from 'http'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 4173

app.use(express.json())

// Debug: check env vars are loaded (remove after confirming)
app.get('/api/health', (req, res) => {
  res.json({ hasKey: !!process.env.ANTHROPIC_API_KEY })
})

// Proxy endpoint for Anthropic API
app.post('/api/anthropic', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY is not set on the server.' } })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: { message: err.message } })
  }
})

// Create a Daily.co room and return its URL
app.post('/api/daily/rooms', async (req, res) => {
  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'DAILY_API_KEY is not set on the server.' })
  try {
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          exp: Math.floor(Date.now() / 1000) + 3600,
          enable_screenshare: true,
          enable_chat: false,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    })
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Return a short-lived Deepgram API key for client-side WebSocket auth
app.get('/api/deepgram/token', async (req, res) => {
  const apiKey = process.env.DEEPGRAM_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'DEEPGRAM_API_KEY is not set on the server.' })
  try {
    const projectsRes = await fetch('https://api.deepgram.com/v1/projects', {
      headers: { Authorization: `Token ${apiKey}` },
    })
    const { projects } = await projectsRes.json()
    if (!projects?.length) throw new Error('No Deepgram projects found.')
    const projectId = projects[0].project_id

    const keyRes = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: 'speechos-session',
        scopes: ['usage:write'],
        time_to_live_in_seconds: 3600,
      }),
    })
    const data = await keyRes.json()
    res.json({ key: data.key.key })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Proxy endpoint for HeyGen video generation
app.post('/api/heygen/v2/video/generate', async (req, res) => {
  const apiKey = process.env.HEYGEN_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'HEYGEN_API_KEY is not set on the server.' })
  }
  try {
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(req.body),
    })
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Proxy endpoint for HeyGen video status polling
app.get('/api/heygen/v1/video_status.get', async (req, res) => {
  const apiKey = process.env.HEYGEN_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'HEYGEN_API_KEY is not set on the server.' })
  }
  const { video_id } = req.query
  if (!video_id) {
    return res.status(400).json({ error: 'video_id query param is required.' })
  }
  try {
    const response = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${encodeURIComponent(video_id)}`,
      { headers: { 'X-Api-Key': apiKey } }
    )
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Serve built static files
app.use(express.static(join(__dirname, 'dist')))

// SPA fallback
app.get('/{*path}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`SpeechOS running on port ${PORT}`)
})
