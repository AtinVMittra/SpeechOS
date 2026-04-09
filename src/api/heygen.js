// HeyGen AI Avatar Video Generation
// Generates a talking-head avatar video from a lesson script.
// API docs: https://docs.heygen.com/reference/generate-video-v2
const DEFAULT_AVATAR_ID = 'Angela-inblackskirt-20220820'
const DEFAULT_AVATAR_STYLE = 'normal'

// Both dev and prod route through /api/heygen — dev uses Vite proxy, prod uses Express proxy.
const HEYGEN_BASE = '/api/heygen'

export async function generateHeyGenVideo(lessonScript, avatarId = DEFAULT_AVATAR_ID) {
  const videoInputs = lessonScript.segments.map(segment => ({
    character: {
      type: 'avatar',
      avatar_id: avatarId,
      avatar_style: DEFAULT_AVATAR_STYLE,
    },
    voice: {
      type: 'text',
      input_text: segment.speakerText,
      voice_id: 'en-US-JennyNeural',
      speed: 0.95,
    },
    background: {
      type: 'color',
      value: '#f8fafc',
    },
  }))

  const response = await fetch(`${HEYGEN_BASE}/v2/video/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      video_inputs: videoInputs,
      dimension: { width: 390, height: 844 },
      caption: false,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.message || `HeyGen generate error ${response.status}`)
  }

  const data = await response.json()
  const videoId = data.data?.video_id || data.video_id
  if (!videoId) throw new Error('HeyGen did not return a video_id.')
  return videoId
}

export async function pollHeyGenVideo(videoId) {
  const response = await fetch(
    `${HEYGEN_BASE}/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`
  )

  if (!response.ok) {
    throw new Error(`HeyGen status error ${response.status}`)
  }

  const data = await response.json()
  return {
    status: data.data?.status || data.status,
    videoUrl: data.data?.video_url || null,
    thumbnailUrl: data.data?.thumbnail_url || null,
    error: data.data?.error || null,
  }
}
