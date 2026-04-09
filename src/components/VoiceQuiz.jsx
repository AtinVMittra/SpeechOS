import { useState, useEffect, useRef } from 'react'

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function computeSimilarity(recognized, target) {
  if (!recognized || !target) return 0
  const dist = levenshtein(recognized.toLowerCase(), target.toLowerCase())
  return 1 - dist / Math.max(recognized.length, target.length, 1)
}

const GRADE_CONFIG = {
  A: { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', xp: 30, msg: 'Excellent pronunciation!' },
  B: { color: 'text-teal-600',    bg: 'bg-teal-50 border-teal-200',       xp: 20, msg: 'Great job! Almost perfect.' },
  C: { color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',     xp: 10, msg: 'Good try! Keep practicing.' },
  D: { color: 'text-red-500',     bg: 'bg-red-50 border-red-200',         xp: 5,  msg: 'Nice effort! Try again.' },
}

export default function VoiceQuiz({ targetWord, onGrade }) {
  const [supported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition))
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [grade, setGrade] = useState(null)
  const [fallbackInput, setFallbackInput] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch (_) {}
      }
    }
  }, [])

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = false
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)

    recognition.onresult = (e) => {
      const heard = e.results[0][0].transcript.trim()
      setTranscript(heard)
      gradeAnswer(heard)
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognition.start()
  }

  function gradeAnswer(answer) {
    const score = computeSimilarity(answer, targetWord)
    const g = score >= 0.85 ? 'A' : score >= 0.65 ? 'B' : score >= 0.35 ? 'C' : 'D'
    setGrade(g)
    onGrade(g, GRADE_CONFIG[g].xp)
  }

  function handleFallbackSubmit() {
    if (!fallbackInput.trim()) return
    setTranscript(fallbackInput.trim())
    gradeAnswer(fallbackInput.trim())
  }

  return (
    <div className="space-y-5">
      {/* Target word */}
      <div className="text-center py-6 bg-gradient-to-b from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
        <p className="text-xs text-blue-500 font-medium uppercase tracking-wider mb-2">Say this word</p>
        <p className="text-4xl font-bold text-slate-800 tracking-wide">{targetWord}</p>
        <p className="text-xs text-slate-400 mt-2">Speak clearly into your microphone</p>
      </div>

      {!grade && (
        <>
          {supported ? (
            <div className="text-center space-y-4">
              {/* Waveform animation while listening */}
              {listening && (
                <div className="flex items-center justify-center gap-1 h-10">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-teal-500"
                      style={{
                        animation: 'audioBar 0.8s ease-in-out infinite',
                        animationDelay: `${i * 0.12}s`,
                        height: '32px',
                      }}
                    />
                  ))}
                </div>
              )}
              {!listening && (
                <p className="text-sm text-slate-400">Press the mic and say the word above</p>
              )}
              <button
                onClick={startListening}
                disabled={listening}
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all shadow-lg ${
                  listening
                    ? 'bg-red-500 scale-110 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 hover:scale-105'
                }`}
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              {listening && <p className="text-sm font-medium text-red-500 animate-pulse">Listening…</p>}
            </div>
          ) : (
            /* Fallback for browsers without speech API */
            <div className="space-y-3">
              <p className="text-sm text-slate-500 text-center">Voice input unavailable — type the word below:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fallbackInput}
                  onChange={e => setFallbackInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFallbackSubmit()}
                  placeholder={`Type "${targetWord}"`}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={handleFallbackSubmit}
                  className="bg-teal-600 text-white text-sm font-medium px-4 rounded-xl hover:bg-teal-700"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Grade result */}
      {grade && (
        <div className={`border rounded-2xl p-5 text-center ${GRADE_CONFIG[grade].bg}`}>
          <div className={`text-6xl font-black ${GRADE_CONFIG[grade].color}`}>{grade}</div>
          <p className={`text-sm font-semibold mt-2 ${GRADE_CONFIG[grade].color}`}>{GRADE_CONFIG[grade].msg}</p>
          {transcript && (
            <p className="text-xs text-slate-500 mt-2">You said: <span className="font-medium italic">"{transcript}"</span></p>
          )}
          <p className="text-xs font-medium text-teal-700 mt-2 bg-teal-50 border border-teal-100 rounded-full px-3 py-1 inline-block">
            +{GRADE_CONFIG[grade].xp} XP earned
          </p>
        </div>
      )}
    </div>
  )
}
