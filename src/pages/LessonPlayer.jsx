import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePatientData } from '../context/PatientDataContext.jsx'
import { generateLessonScript } from '../api/anthropic.js'
import { synthesizeLessonAudio } from '../api/elevenlabs.js'

export default function LessonPlayer() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { getPatientById } = usePatientData()
  const patient = getPatientById(patientId)

  // Phase: 'generating' | 'audio-ready' | 'error'
  const [phase, setPhase] = useState('generating')
  const [lessonScript, setLessonScript] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [error, setError] = useState(null)
  const [scriptReady, setScriptReady] = useState(false)

  // Audio player state
  const [playing, setPlaying] = useState(false)
  const [audioStarted, setAudioStarted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0)

  const audioRef = useRef(null)
  const audioUrlRef = useRef(null)

  useEffect(() => {
    if (!patient) return

    async function init() {
      try {
        const script = await generateLessonScript(patient)
        setLessonScript(script)
        setScriptReady(true)

        const url = await synthesizeLessonAudio(script.fullAudioScript)
        audioUrlRef.current = url
        setAudioUrl(url)
        setPhase('audio-ready')
      } catch (err) {
        setError(err.message)
        setPhase('error')
      }
    }

    init()

    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    }
  }, [])

  function handlePlayPause() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  function handleSeek(e) {
    if (!audioRef.current) return
    const val = parseFloat(e.target.value)
    audioRef.current.currentTime = val
    setCurrentTime(val)
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return
    const t = audioRef.current.currentTime
    setCurrentTime(t)
    if (duration > 0 && lessonScript?.segments) {
      const segCount = lessonScript.segments.length
      const idx = Math.min(Math.floor((t / duration) * segCount), segCount - 1)
      setActiveSegmentIdx(idx)
    }
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Patient not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-[390px] flex flex-col min-h-screen">

        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/patient/${patientId}`)}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <p className="text-xs text-slate-400">Pre-Session</p>
            <p className="text-sm font-semibold text-slate-800">Today's Lesson</p>
          </div>
          {phase === 'audio-ready' && (
            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full border border-teal-100">
              🎓 Ready
            </span>
          )}
        </div>

        {/* Generating phase */}
        {phase === 'generating' && (
          <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-b from-teal-500 to-teal-600 px-6 pt-8 pb-10 rounded-b-3xl">
              <div className="text-5xl text-center mb-4" style={{ animation: 'celebrationPulse 2s ease-in-out infinite' }}>
                🎓
              </div>
              <h2 className="text-white text-xl font-bold text-center">Preparing your lesson…</h2>
              <p className="text-teal-100 text-sm text-center mt-1">
                Victoria is getting ready for you
              </p>
            </div>

            <div className="px-5 py-6 space-y-3">
              <div className={`flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border transition-colors ${scriptReady ? 'border-emerald-200' : 'border-slate-100'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${scriptReady ? 'bg-emerald-100 text-emerald-600' : 'bg-teal-50 text-teal-400'}`}>
                  {scriptReady ? '✓' : (
                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${scriptReady ? 'text-emerald-700' : 'text-slate-700'}`}>
                    Writing your lesson script
                  </p>
                  <p className="text-xs text-slate-400">Personalized for {patient.name.split(' ')[0]}'s exercises</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border transition-colors ${audioUrl ? 'border-emerald-200' : 'border-slate-100'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${audioUrl ? 'bg-emerald-100 text-emerald-600' : scriptReady ? 'bg-teal-50' : 'bg-slate-50'}`}>
                  {audioUrl ? '✓' : scriptReady ? (
                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-slate-300 text-xs">2</span>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${audioUrl ? 'text-emerald-700' : 'text-slate-700'}`}>
                    Synthesizing Victoria's voice
                  </p>
                  <p className="text-xs text-slate-400">Victoria · Your Virtual SLP</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error phase */}
        {phase === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 space-y-5">
            <div className="text-5xl">😔</div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-800">Couldn't generate lesson</h2>
              <p className="text-sm text-slate-500 mt-1">{error}</p>
            </div>
            <button
              onClick={() => navigate(`/patient/${patientId}/session`)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm py-3.5 rounded-2xl transition-colors"
            >
              Begin Exercises Anyway →
            </button>
          </div>
        )}

        {/* Audio-ready phase */}
        {phase === 'audio-ready' && lessonScript && (
          <div className="flex-1 overflow-y-auto">
            {/* Teal hero */}
            <div className="bg-gradient-to-b from-teal-500 to-teal-600 px-6 pt-6 pb-8 rounded-b-3xl">
              <p className="text-teal-100 text-sm">{lessonScript.todaysFocus}</p>
              <h2 className="text-white text-xl font-bold mt-1">
                Hi, {lessonScript.patientName}! 👋
              </h2>
              <p className="text-teal-100 text-sm mt-0.5">Your lesson is ready</p>
            </div>

            <div className="px-5 py-5 space-y-4">

              {/* Audio player card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-lg shrink-0">
                    🎧
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">Audio Lesson</p>
                    <p className="text-xs text-slate-400">Victoria · Your Virtual SLP</p>
                  </div>
                  {duration > 0 && (
                    <span className="text-xs text-slate-400">{formatTime(duration)}</span>
                  )}
                </div>

                {/* Seek bar */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || lessonScript.estimatedDurationSeconds || 60}
                    step={0.5}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 rounded-full accent-teal-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || lessonScript.estimatedDurationSeconds || 0)}</span>
                  </div>
                </div>

                {/* Play/Pause button */}
                <button
                  onClick={handlePlayPause}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {playing ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      {audioStarted ? 'Resume Lesson' : 'Play Lesson'}
                    </>
                  )}
                </button>

                {/* Hidden audio element */}
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onPlay={() => { setPlaying(true); setAudioStarted(true) }}
                  onPause={() => setPlaying(false)}
                  onEnded={() => setPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={() => {
                    if (audioRef.current) setDuration(audioRef.current.duration)
                  }}
                />
              </div>

              {/* Lesson outline */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Lesson Outline</h3>
                <div className="space-y-2">
                  {lessonScript.segments.map((seg, i) => (
                    <div
                      key={seg.id}
                      className={`flex items-center gap-3 py-1.5 px-2 rounded-xl transition-colors ${
                        i === activeSegmentIdx && audioStarted
                          ? 'bg-teal-50 border border-teal-100'
                          : ''
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i < activeSegmentIdx && audioStarted
                          ? 'bg-emerald-100 text-emerald-600'
                          : i === activeSegmentIdx && audioStarted
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {i < activeSegmentIdx && audioStarted ? '✓' : i + 1}
                      </div>
                      <p className={`text-sm ${
                        i === activeSegmentIdx && audioStarted
                          ? 'font-semibold text-teal-700'
                          : i < activeSegmentIdx && audioStarted
                          ? 'text-emerald-600'
                          : 'text-slate-600'
                      }`}>
                        {seg.displayTitle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Begin Exercises button */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => navigate(`/patient/${patientId}/session`)}
                  disabled={!audioStarted}
                  className={`w-full font-semibold text-sm py-3.5 rounded-2xl transition-all ${
                    audioStarted
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {audioStarted ? 'Begin Exercises →' : 'Play lesson to begin…'}
                </button>
                <button
                  onClick={() => navigate(`/patient/${patientId}/session`)}
                  className="w-full text-slate-400 text-sm py-2 text-center hover:text-slate-600 transition-colors"
                >
                  Skip lesson and go straight to exercises
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
