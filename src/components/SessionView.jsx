import { useState, useEffect, useRef } from 'react'
import { structureScribeOutput } from '../api/anthropic.js'
import { usePatientData } from '../context/PatientDataContext.jsx'
import FlashcardDrill from './games/FlashcardDrill.jsx'
import MinimalPairs from './games/MinimalPairs.jsx'
import WordSort from './games/WordSort.jsx'

// ─── Game renderer ────────────────────────────────────────────────────────────

function GameRenderer({ exercise }) {
  if (!exercise) return null
  switch (exercise.gameType) {
    case 'flashcard': return <FlashcardDrill exercise={exercise} />
    case 'minimal-pairs': return <MinimalPairs exercise={exercise} />
    case 'word-sort': return <WordSort exercise={exercise} />
    default: return (
      <div className="p-4 space-y-2">
        <p className="text-sm font-semibold text-slate-700">{exercise.title}</p>
        <p className="text-sm text-slate-600 leading-relaxed">{exercise.instructions || exercise.instruction}</p>
        {exercise.materials && (
          <p className="text-xs text-slate-400">
            <span className="font-medium text-slate-500">Materials:</span> {exercise.materials}
          </p>
        )}
      </div>
    )
  }
}

// ─── Daily.co video ───────────────────────────────────────────────────────────

async function createDailyRoom() {
  const res = await fetch('/api/daily/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  const data = await res.json()
  if (!data.url) throw new Error(data.error || 'Could not create Daily room.')
  return data.url
}

function DailyVideo() {
  const [roomUrl, setRoomUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleStart() {
    setLoading(true)
    setError(null)
    try {
      const url = await createDailyRoom()
      setRoomUrl(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleEnd() {
    setRoomUrl(null)
  }

  if (roomUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-slate-900" style={{ aspectRatio: '16/9' }}>
        <iframe
          src={roomUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
          className="w-full h-full border-0"
          title="Video session"
        />
        <button
          onClick={handleEnd}
          className="absolute top-3 right-3 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full transition-colors shadow-lg"
        >
          End Call
        </button>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-4 py-12" style={{ aspectRatio: '16/9' }}>
      <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <div className="text-center">
        <p className="text-sm text-slate-400 mb-1">Video call via Daily.co</p>
        <p className="text-xs text-slate-600">Patient joins using the room link</p>
      </div>
      <button
        onClick={handleStart}
        disabled={loading}
        className="flex items-center gap-2 text-sm font-semibold bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl transition-colors"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Creating room…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Start Video Call
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-400 text-center px-4">{error}</p>}
    </div>
  )
}

// ─── Exercise panel ───────────────────────────────────────────────────────────

const GAME_TYPE_LABEL = { 'flashcard': 'Flashcard Drill', 'minimal-pairs': 'Minimal Pairs', 'word-sort': 'Word Sort' }
const GAME_TYPE_COLOR = { 'flashcard': 'bg-teal-100 text-teal-700', 'minimal-pairs': 'bg-blue-100 text-blue-700', 'word-sort': 'bg-violet-100 text-violet-700' }

function ExercisePanel({ exercises }) {
  const [current, setCurrent] = useState(0)

  if (!exercises || exercises.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-2">
      <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <p className="text-sm text-slate-400">No games yet.</p>
      <p className="text-xs text-slate-300">Generate a session plan first.</p>
    </div>
  )

  const ex = exercises[current]
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {ex.gameType && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${GAME_TYPE_COLOR[ex.gameType] || 'bg-slate-100 text-slate-600'}`}>
              {GAME_TYPE_LABEL[ex.gameType] || ex.gameType}
            </span>
          )}
          <span className="text-xs font-semibold text-slate-700 truncate">{ex.title}</span>
        </div>
        <span className="text-xs text-slate-400 shrink-0 ml-2">{current + 1}/{exercises.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <GameRenderer exercise={ex} />
      </div>
      <div className="p-2 border-t border-slate-100 flex gap-2 shrink-0">
        <button onClick={() => setCurrent(i => Math.max(0, i - 1))} disabled={current === 0}
          className="flex-1 text-xs font-medium py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          ← Prev
        </button>
        <button onClick={() => setCurrent(i => Math.min(exercises.length - 1, i + 1))} disabled={current === exercises.length - 1}
          className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors">
          Next →
        </button>
      </div>
    </div>
  )
}

// ─── Deepgram scribe ──────────────────────────────────────────────────────────

async function getDeepgramKey() {
  if (import.meta.env.DEV) {
    const key = import.meta.env.VITE_DEEPGRAM_API_KEY
    if (!key) throw new Error('VITE_DEEPGRAM_API_KEY is not set in .env')
    return key
  }
  const res = await fetch('/api/deepgram/token')
  const data = await res.json()
  if (!data.key) throw new Error(data.error || 'Could not get Deepgram token')
  return data.key
}

function useDeepgramScribe() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  const wsRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const finalTextRef = useRef('')

  async function start() {
    setError(null)
    try {
      const key = await getDeepgramKey()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ws = new WebSocket(
        'wss://api.deepgram.com/v1/listen?language=en-US&model=nova-2&interim_results=true&punctuate=true&smart_format=true',
        ['token', key]
      )
      wsRef.current = ws

      ws.onopen = () => {
        setIsListening(true)
        // Send audio in 250 ms chunks
        const mr = new MediaRecorder(stream)
        mediaRecorderRef.current = mr
        mr.ondataavailable = (e) => {
          if (ws.readyState === WebSocket.OPEN && e.data.size > 0) ws.send(e.data)
        }
        mr.start(250)
      }

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data)
        if (msg.type !== 'Results') return
        const text = msg.channel?.alternatives?.[0]?.transcript
        if (!text) return
        if (msg.is_final) {
          finalTextRef.current += text + ' '
          setTranscript(finalTextRef.current)
        } else {
          setTranscript(finalTextRef.current + text)
        }
      }

      ws.onerror = () => {
        setError('Deepgram connection failed. Check your API key and network.')
        setIsListening(false)
      }
      ws.onclose = () => setIsListening(false)

    } catch (err) {
      setError(err.message)
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop()
    wsRef.current?.close()
    streamRef.current?.getTracks().forEach(t => t.stop())
    setIsListening(false)
  }

  function reset() {
    stop()
    finalTextRef.current = ''
    setTranscript('')
    setError(null)
  }

  useEffect(() => () => stop(), [])

  return { transcript, isListening, error, start, stop, reset, setTranscript }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SessionView({ patient }) {
  const { saveScribeTranscript, saveSoapNote } = usePatientData()
  const { transcript, isListening, error: scribeError, start, stop, reset, setTranscript } = useDeepgramScribe()
  const [structuring, setStructuring] = useState(false)
  const [structureError, setStructureError] = useState(null)
  const [soapSaved, setSoapSaved] = useState(false)
  const transcriptRef = useRef(null)

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
  }, [transcript])

  async function handleStructure() {
    if (!transcript.trim()) return
    setStructuring(true)
    setStructureError(null)
    setSoapSaved(false)
    try {
      saveScribeTranscript(patient.id, transcript)
      const soap = await structureScribeOutput(transcript, patient)
      saveSoapNote(patient.id, soap)
      setSoapSaved(true)
    } catch (err) {
      setStructureError(err.message)
    } finally {
      setStructuring(false)
    }
  }

  const exercises = patient?.sessionPlan?.exercises || patient?.exercises || []

  if (!patient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-1">Select a patient first</h3>
        <p className="text-sm text-slate-400 max-w-xs">Choose a patient from your caseload to start a session.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Session</h2>
        <p className="text-sm text-slate-500 mt-0.5">{patient.name} · Age {patient.age} · {patient.condition}</p>
      </div>

      {/* Video + exercises */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <DailyVideo />
        </div>
        <div className="col-span-2 border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-white" style={{ minHeight: '220px' }}>
          <ExercisePanel exercises={exercises} />
        </div>
      </div>

      {/* Live Deepgram Scribe */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 18.364a9 9 0 010-12.728M8.464 15.536a5 5 0 010-7.072" />
          </svg>
          <h3 className="text-sm font-semibold text-white">Live AI Scribe</h3>
          <span className="text-xs text-slate-400 ml-1">· Deepgram nova-2</span>
          {isListening && (
            <span className="ml-1 flex items-center gap-1 text-xs text-emerald-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Recording
            </span>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div
            ref={transcriptRef}
            className="min-h-[100px] max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"
          >
            {transcript || <span className="text-slate-400 italic">Transcript will appear here as you speak…</span>}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isListening ? (
              <button onClick={start}
                className="flex items-center gap-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                Start Recording
              </button>
            ) : (
              <button onClick={stop}
                className="flex items-center gap-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                Stop Recording
              </button>
            )}

            <button onClick={handleStructure} disabled={!transcript.trim() || structuring}
              className="flex items-center gap-2 text-sm font-medium bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors">
              {structuring ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Structuring…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Structure as SOAP Note
                </>
              )}
            </button>

            <button onClick={reset}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Clear
            </button>

            {soapSaved && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                SOAP note saved — view in the SOAP tab
              </span>
            )}
            {(scribeError || structureError) && (
              <span className="text-xs text-red-600">{scribeError || structureError}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
