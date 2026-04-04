import { useState, useMemo } from 'react'

// ─── Clinical Knowledge Base ──────────────────────────────────────────────────
const CHUNKS = [
  {
    id: 'c1',
    title: '/r/ Articulation — Isolation Practice',
    category: 'Articulation',
    source: 'ASHA Clinical Practice Guidelines',
    text: 'The /r/ phoneme is one of the last sounds acquired, typically mastered by age 6–8. For isolation practice, instruct caregivers to have the child practice the "bunched" or "retroflexed" tongue position. In the bunched position, the tongue body is raised toward the palate with sides touching upper molars. Practice in front of a mirror for 5–10 minutes daily. Contrast minimal pairs (e.g., "rabbit" vs "abbit") to build phonemic awareness. Move from isolation (/r/) → syllables (ra, re, ri) → words → phrases only when the child achieves 80% accuracy at each level.',
  },
  {
    id: 'c2',
    title: '/s/ and /z/ Articulation — Lisp Correction',
    category: 'Articulation',
    source: 'Van Riper Articulation Therapy',
    text: 'Interdental lisps (tongue protrusion on /s/ and /z/) are addressed by teaching correct tongue placement: tongue tip stays behind upper front teeth, not between them. Instruct caregivers to use the "teeth together" cue — child closes teeth lightly and directs airflow between them. Dentalized lisps (tongue touching upper teeth) respond to "tongue back" tactile cues. Recommended home practice: 10 minutes daily in a quiet environment. Use printed word lists with /s/ in initial, medial, and final positions. Avoid practicing when the child is fatigued, as this increases error rate.',
  },
  {
    id: 'c3',
    title: 'Stuttering — Fluency Shaping Techniques',
    category: 'Fluency',
    source: 'Stuttering Foundation of America',
    text: 'Fluency shaping techniques for school-age children include easy onset (beginning phonation gently, like a soft sigh into the word), light articulatory contact (reducing tension in lips and tongue), and slow rate via stretched vowels. Caregivers should model slow, relaxed speech at home without calling attention to stuttering moments. The "turtle speech" metaphor helps young children understand reduced rate. Avoid finishing sentences for the child or showing visible frustration during disfluencies. A supportive communication environment — unhurried, attentive listening — reduces communicative pressure and lowers stuttering frequency in 70–80% of cases.',
  },
  {
    id: 'c4',
    title: 'Language Delay — Wh-Question Scaffolding',
    category: 'Language',
    source: 'Paul & Norbury Language Intervention',
    text: 'Wh-questions develop in a predictable order: "what" and "where" emerge around 2–3 years, "who" and "which" at 3–4, "when" and "why" at 4–5. For caregivers working on wh-question comprehension, use daily routines as contexts (bath time, meals, play). Ask "what\'s that?" during naming tasks, "where is the ball?" during hide-and-seek. For production, use forced-choice scaffolding: "Did the dog run or jump? What did the dog do?" Accept non-verbal pointing initially, then shape toward verbal responses. Respond to all communication attempts to reinforce communicative intent before focusing on form.',
  },
  {
    id: 'c5',
    title: 'AAC — Core Vocabulary Home Practice',
    category: 'AAC',
    source: 'ASHA AAC Evidence Map',
    text: 'Augmentative and Alternative Communication (AAC) devices require consistent modeling by communication partners at home. Use "aided language stimulation" — the caregiver points to symbols on the device while speaking normally. Focus first on core vocabulary (high-frequency words: more, go, stop, want, help, like, feel), not just nouns. Teach one or two new symbols per week, practicing in natural contexts. Do not require the child to use AAC before responding to their communication — this creates pressure. The "no-tech always available" principle means low-tech boards (paper symbols) should be accessible in all rooms as backup.',
  },
  {
    id: 'c6',
    title: 'Dysphagia — Safe Swallowing at Home',
    category: 'Swallowing',
    source: 'ASHA Dysphagia Practice Portal',
    text: 'Caregivers managing a patient with dysphagia (swallowing disorder) must follow texture-modified diet recommendations precisely. IDDSI Level 4 (puréed) foods must be smooth, cohesive, and lump-free — not just soft. Ensure upright positioning at 90 degrees during all meals and for 30 minutes post-meal to reduce aspiration risk. Thin liquids are highest risk; if thickened liquids are prescribed, use a commercial thickener and verify nectar vs honey consistency with a spoon-tilt test. Avoid mixed-texture foods (soup with chunks, cereal in milk). Signs of silent aspiration — coughing after meals, wet or gurgly voice quality, recurring chest infections — should trigger immediate SLP contact.',
  },
  {
    id: 'c7',
    title: 'Childhood Apraxia of Speech — Multisensory Cueing',
    category: 'Motor Speech',
    source: 'Apraxia Kids / DTTC Guidelines',
    text: 'Childhood Apraxia of Speech (CAS) requires motor learning principles: high practice intensity (100+ trials per session), variable practice across contexts, and immediate feedback. The Dynamic Temporal and Tactile Cueing (DTTC) hierarchy begins with simultaneous production (SLP and child speak together), then immediate imitation, then delayed imitation, then spontaneous production. Caregivers should practice target words in short, frequent sessions (5–10 minutes, 3–4× daily) rather than one long session. Use multisensory cues: tactile (touch jaw/cheeks), visual (mirror), verbal ("feel your lips come together"). Prioritize functional words — words the child is motivated to say — for maximum carryover.',
  },
  {
    id: 'c8',
    title: 'Voice Disorders — Vocal Hygiene Program',
    category: 'Voice',
    source: 'ASHA Voice Disorders Clinical Practice',
    text: 'Vocal hygiene is first-line treatment for benign vocal pathologies (nodules, polyps, edema). Core components for caregivers: hydration (8 glasses of water daily, humidifier at night), voice rest after vocal overuse events, elimination of throat clearing (replace with a sip of water), and reducing loud talking in noisy environments. Children with vocal nodules should avoid shouting during sports or play — use a "silent signal" system instead. Caffeinated and carbonated beverages worsen vocal fold dryness. Whispering is NOT vocal rest — it creates higher subglottic pressure than normal phonation. True vocal rest means no voice use whatsoever for prescribed periods.',
  },
  {
    id: 'c9',
    title: 'Narrative Language — Story Retelling at Home',
    category: 'Language',
    source: 'Westby Story Grammar Curriculum',
    text: 'Narrative skills are strongly predictive of reading comprehension and academic success. Story Grammar components develop in sequence: characters → setting → initiating event → internal response → plan → attempt → consequence → reaction. For home practice, caregivers can use "story retelling with pictures" — child retells a familiar book using illustrations as cues. Use scaffolding questions: "Who was the story about? What did they want? What happened first? What happened next? How did it end?" The "CROWD" technique during shared book reading (Completion, Recall, Open-ended, Wh-questions, Distancing prompts) builds narrative language naturally. Target 3–5 story grammar elements before moving to full story production.',
  },
  {
    id: 'c10',
    title: 'Feeding Therapy — Sensory Food Introduction',
    category: 'Feeding',
    source: 'SOS Approach to Feeding / ASHA Feeding Portal',
    text: 'Sensory-based feeding difficulties require a systematic food exposure hierarchy: Tolerates (food in environment) → Interacts (touches food) → Smells → Touches to lips → Kisses → Licks → Bites and spits → Chews and swallows. Caregivers should introduce one new food at a time alongside 2–3 accepted foods in a low-pressure environment. The "learning plate" concept separates new foods from the eating plate to reduce anxiety. Family meals in a positive social context — no screens, no pressure — increase willingness to try new foods by 40% in intervention studies. Never force or pressure feeding; this increases food aversion. Practice "food play" outside meal contexts to reduce anxiety around new textures.',
  },
]

// ─── Category styling ─────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Articulation: 'bg-teal-100 text-teal-700',
  Fluency:      'bg-blue-100 text-blue-700',
  Language:     'bg-purple-100 text-purple-700',
  AAC:          'bg-orange-100 text-orange-700',
  Swallowing:   'bg-red-100 text-red-700',
  'Motor Speech': 'bg-indigo-100 text-indigo-700',
  Voice:        'bg-pink-100 text-pink-700',
  Feeding:      'bg-amber-100 text-amber-700',
}

// ─── TF-IDF Similarity Search ─────────────────────────────────────────────────
const STOPWORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
  'from','is','was','are','were','be','been','being','have','has','had','do',
  'does','did','will','would','could','should','may','might','shall','can',
  'that','this','these','those','it','its','they','their','there','he','she',
  'we','you','i','me','my','your','our','not','no','as','if','then','than',
  'so','also','just','about','after','before','when','where','how','what',
  'who','which','any','all','more','most','some','other','each','into','up',
  'out','through','only','even','well','such','both','very','too','often',
])

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t))
}

function buildIDF(chunks) {
  const N = chunks.length
  const df = {}
  for (const chunk of chunks) {
    const terms = new Set(tokenize(chunk.title + ' ' + chunk.text))
    for (const term of terms) df[term] = (df[term] || 0) + 1
  }
  const idf = {}
  for (const [term, freq] of Object.entries(df)) {
    idf[term] = Math.log((N + 1) / (freq + 1)) + 1
  }
  return idf
}

function tfidfVector(tokens, idf) {
  const tf = {}
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1
  const total = tokens.length || 1
  const vec = {}
  for (const [term, count] of Object.entries(tf)) {
    vec[term] = (count / total) * (idf[term] || Math.log((CHUNKS.length + 1) / 1) + 1)
  }
  return vec
}

function cosineSimilarity(v1, v2) {
  let dot = 0, mag1 = 0, mag2 = 0
  const allTerms = new Set([...Object.keys(v1), ...Object.keys(v2)])
  for (const t of allTerms) {
    const a = v1[t] || 0
    const b = v2[t] || 0
    dot += a * b
    mag1 += a * a
    mag2 += b * b
  }
  if (mag1 === 0 || mag2 === 0) return 0
  return dot / (Math.sqrt(mag1) * Math.sqrt(mag2))
}

function searchChunks(query, idf, chunkVectors) {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []
  const qVec = tfidfVector(tokens, idf)
  return CHUNKS
    .map((chunk, i) => ({ chunk, score: cosineSimilarity(qVec, chunkVectors[i]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter(r => r.score > 0)
}

// ─── Anthropic API call (mirrors src/api/anthropic.js pattern) ────────────────
const IS_DEV = import.meta.env.DEV
const API_URL = IS_DEV ? 'https://api.anthropic.com/v1/messages' : '/api/anthropic'

const SYSTEM_PROMPT = `You are a clinical knowledge assistant for SpeechOS, a platform connecting SLPs with caregivers for home practice. Answer using ONLY the provided context chunks. Be specific and practical. If the question is about home practice, give concrete caregiver-actionable guidance. If context is insufficient, say so.`

async function generateRAGResponse(query, retrievedChunks) {
  const headers = { 'Content-Type': 'application/json' }

  if (IS_DEV) {
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!key) throw new Error('VITE_ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.')
    headers['x-api-key'] = key
    headers['anthropic-version'] = '2023-06-01'
    headers['anthropic-dangerous-allow-browser'] = 'true'
  }

  const contextBlock = retrievedChunks
    .map((r, i) =>
      `[Chunk ${i + 1}] ${r.chunk.title} (${r.chunk.category})\nSource: ${r.chunk.source}\n${r.chunk.text}`
    )
    .join('\n\n')

  const userMessage = `Context:\n${contextBlock}\n\nQuestion: ${query}`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ClinicalRAG() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState(null)   // [{ chunk, score }]
  const [response, setResponse] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [activeChunkId, setActiveChunkId] = useState(null)

  // Precompute IDF and per-chunk TF-IDF vectors once
  const { idf, chunkVectors } = useMemo(() => {
    const idf = buildIDF(CHUNKS)
    const chunkVectors = CHUNKS.map(chunk =>
      tfidfVector(tokenize(chunk.title + ' ' + chunk.text), idf)
    )
    return { idf, chunkVectors }
  }, [])

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResponse('')
    setResults(null)

    try {
      const top3 = searchChunks(query, idf, chunkVectors)
      setResults(top3)

      if (top3.length === 0) {
        setResponse('No relevant clinical knowledge found for this query. Try rephrasing or using clinical terms.')
        return
      }

      const text = await generateRAGResponse(query.trim(), top3)
      setResponse(text)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSearch()
  }

  return (
    <div className="flex h-full min-h-0 bg-slate-50">
      {/* ── Left sidebar: knowledge base ── */}
      <aside className="w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Knowledge Base</h2>
          <p className="text-xs text-slate-400 mt-0.5">{CHUNKS.length} clinical chunks</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2">
          {CHUNKS.map(chunk => (
            <button
              key={chunk.id}
              onClick={() => setActiveChunkId(activeChunkId === chunk.id ? null : chunk.id)}
              className={`w-full text-left px-3 py-3 rounded-lg transition-colors border ${
                activeChunkId === chunk.id
                  ? 'border-teal-200 bg-teal-50'
                  : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-2 mb-1.5">
                <span
                  className={`shrink-0 mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    CATEGORY_COLORS[chunk.category] || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {chunk.category}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-800 leading-snug">{chunk.title}</p>
              {activeChunkId === chunk.id ? (
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{chunk.text}</p>
              ) : (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-snug">
                  {chunk.text.slice(0, 100)}…
                </p>
              )}
              <p className="text-[10px] text-slate-300 mt-1">{chunk.source}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Right main area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="px-6 py-5 border-b border-slate-200 bg-white">
          <h1 className="text-lg font-semibold text-slate-900">Clinical RAG Assistant</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ask a clinical question. Top matching knowledge chunks are retrieved, then Claude generates a grounded response.
          </p>
        </div>

        <div className="flex-1 px-6 py-5 space-y-6 max-w-3xl">
          {/* Query input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Clinical Question</label>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="e.g. How should caregivers practice /r/ sounds at home with a 7-year-old?"
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none bg-white leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">⌘↵ to search</span>
              <span className="text-xs text-slate-400">{query.length} chars</span>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Retrieving &amp; generating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                Search &amp; Generate
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Retrieved chunks */}
          {results && results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Retrieved Chunks — Top {results.length}
              </h3>
              {results.map(({ chunk, score }, i) => (
                <div key={chunk.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        CATEGORY_COLORS[chunk.category] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {chunk.category}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-800 flex-1">{chunk.title}</h4>
                    <span className="text-xs font-mono text-slate-400 shrink-0" title="Cosine similarity score">
                      {(score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-slate-600 leading-relaxed">{chunk.text}</p>
                    <p className="text-[10px] text-slate-300 mt-2">{chunk.source}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI response */}
          {response && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                AI-Generated Response
              </h3>
              <div className="border border-teal-200 rounded-xl bg-teal-50 px-5 py-4">
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{response}</p>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Generated by claude-sonnet-4-20250514 · Grounded in retrieved clinical chunks only
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
