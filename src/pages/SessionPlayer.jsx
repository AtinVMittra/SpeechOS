import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePatientData } from '../context/PatientDataContext.jsx'
import VoiceQuiz from '../components/VoiceQuiz.jsx'
import XpPopup from '../components/XpPopup.jsx'
import SessionComplete from '../components/SessionComplete.jsx'

const MOTIVATIONAL_MESSAGES = [
  'Great work! Keep going! 💪',
  'You\'re doing amazing! 🌟',
  'One step closer! 🎯',
  'Fantastic effort! 🔥',
  'You\'re a star! ⭐',
]

function VideoExercise({ exercise, onComplete }) {
  const [watched, setWatched] = useState(false)

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative">
        {exercise.videoUrl ? (
          <iframe
            src={exercise.videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={exercise.title}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center">
              <svg className="w-7 h-7 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
            <p className="text-sm">Video unavailable</p>
          </div>
        )}
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-800 leading-relaxed">{exercise.instruction}</p>
      </div>
      <button
        onClick={() => { setWatched(true); onComplete(10) }}
        className={`w-full font-semibold text-sm py-3.5 rounded-2xl transition-colors ${
          watched
            ? 'bg-emerald-500 text-white'
            : 'bg-teal-600 hover:bg-teal-700 text-white'
        }`}
      >
        {watched ? '✓ Watched!' : 'Mark as Watched'}
      </button>
    </div>
  )
}

function StandardExercise({ exercise, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(10)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)

  function startTimer() {
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          setDone(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const progress = ((10 - timeLeft) / 10) * 100

  return (
    <div className="space-y-4">
      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3" style={{ animation: running ? 'celebrationPulse 1s ease-in-out infinite' : 'none' }}>
          🗣️
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{exercise.instruction}</p>
      </div>

      {/* Timer bar */}
      {running && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Practice time</span>
            <span className="font-medium text-teal-600">{timeLeft}s</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!running && !done && (
        <button
          onClick={startTimer}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm py-3.5 rounded-2xl transition-colors"
        >
          Start 10s Practice Timer
        </button>
      )}

      {(done || running) && (
        <button
          onClick={() => onComplete(15)}
          disabled={running && !done}
          className={`w-full font-semibold text-sm py-3.5 rounded-2xl transition-colors ${
            done
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {done ? '✓ Done! Next Exercise →' : 'Finish timer first…'}
        </button>
      )}
    </div>
  )
}

export default function SessionPlayer() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { getPatientById } = usePatientData()

  const patient = getPatientById(patientId)
  const exercises = patient?.exercises || []

  const [step, setStep] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [showXpPopup, setShowXpPopup] = useState(false)
  const [pendingXp, setPendingXp] = useState(0)
  const [sessionDone, setSessionDone] = useState(false)
  const [completedIds, setCompletedIds] = useState([])
  const [showInterstitial, setShowInterstitial] = useState(false)
  const [interstitialMsg, setInterstitialMsg] = useState('')

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Patient not found.</p>
      </div>
    )
  }

  if (sessionDone) {
    return (
      <SessionComplete
        patientId={patientId}
        totalXp={xpEarned}
        completedExercises={exercises.map(e => e.title)}
        badgeUnlocked={xpEarned >= 50 ? 'Session Champion' : null}
      />
    )
  }

  const currentExercise = exercises[step]
  const totalSteps = exercises.length

  function handleExerciseComplete(xp) {
    const newTotal = xpEarned + xp
    setXpEarned(newTotal)
    setPendingXp(xp)
    setShowXpPopup(true)
    setCompletedIds(prev => [...prev, currentExercise.id])
  }

  function advanceStep() {
    if (step + 1 >= totalSteps) {
      setSessionDone(true)
    } else {
      const msg = MOTIVATIONAL_MESSAGES[step % MOTIVATIONAL_MESSAGES.length]
      setInterstitialMsg(msg)
      setShowInterstitial(true)
      setTimeout(() => {
        setShowInterstitial(false)
        setStep(s => s + 1)
      }, 1200)
    }
  }

  const isCompleted = completedIds.includes(currentExercise?.id)

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
            <p className="text-xs text-slate-400">Exercise {step + 1} of {totalSteps}</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{currentExercise?.title}</p>
          </div>
          <div className="text-sm font-bold text-teal-600">⚡{xpEarned} XP</div>
        </div>

        {/* Progress bar segments */}
        <div className="flex gap-1 px-5 py-3 bg-white border-b border-slate-100">
          {exercises.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < step || completedIds.includes(exercises[i].id)
                  ? 'bg-teal-500'
                  : i === step
                  ? 'bg-teal-300'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Exercise content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 relative">

          {/* XP Popup */}
          {showXpPopup && (
            <XpPopup xpAmount={pendingXp} onDone={() => setShowXpPopup(false)} />
          )}

          {/* Interstitial */}
          {showInterstitial && (
            <div className="absolute inset-0 z-30 bg-white flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-5xl">🌟</div>
                <p className="text-lg font-bold text-slate-800">{interstitialMsg}</p>
              </div>
            </div>
          )}

          {/* Exercise type card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
            {/* Type badge */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                currentExercise?.type === 'video'
                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                  : currentExercise?.type === 'quiz'
                  ? 'bg-purple-50 text-purple-600 border-purple-100'
                  : 'bg-teal-50 text-teal-600 border-teal-100'
              }`}>
                {currentExercise?.type === 'video' ? '🎬 Video' : currentExercise?.type === 'quiz' ? '🎤 Voice Quiz' : '📋 Exercise'}
              </span>
            </div>

            {/* Render by type */}
            {currentExercise?.type === 'video' && (
              <VideoExercise
                exercise={currentExercise}
                onComplete={(xp) => {
                  if (!isCompleted) {
                    handleExerciseComplete(xp)
                  }
                }}
              />
            )}

            {currentExercise?.type === 'exercise' && (
              <StandardExercise
                exercise={currentExercise}
                onComplete={(xp) => {
                  if (!isCompleted) {
                    handleExerciseComplete(xp)
                  }
                }}
              />
            )}

            {currentExercise?.type === 'quiz' && (
              <VoiceQuiz
                targetWord={currentExercise.targetWord || currentExercise.title}
                onGrade={(grade, xp) => {
                  if (!isCompleted) {
                    handleExerciseComplete(xp)
                  }
                }}
              />
            )}
          </div>

          {/* Next / Finish button — shown after completion */}
          {isCompleted && (
            <button
              onClick={advanceStep}
              className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm py-3.5 rounded-2xl transition-colors"
            >
              {step + 1 >= totalSteps ? 'Finish Session 🎉' : 'Next Exercise →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
