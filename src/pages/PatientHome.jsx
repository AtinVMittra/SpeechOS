import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { usePatientData } from '../context/PatientDataContext.jsx'
import ProgressRing from '../components/ProgressRing.jsx'

const LEVEL_LABELS = ['', 'Beginner', 'Explorer', 'Practitioner', 'Star', 'Champion']

export default function PatientHome() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { getPatientById } = usePatientData()

  const [hasLiveSession, setHasLiveSession] = useState(
    () => !!localStorage.getItem(`speechos_room_${patientId}`)
  )

  useEffect(() => {
    const ch = new BroadcastChannel('speechos-session')
    ch.onmessage = (e) => {
      if (e.data.patientId !== patientId) return
      if (e.data.type === 'room_created') setHasLiveSession(true)
      if (e.data.type === 'session_ended') setHasLiveSession(false)
    }
    return () => ch.close()
  }, [patientId])

  const patient = getPatientById(patientId)
  const sessionCompleted = location.state?.sessionCompleted === true

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-slate-500">Patient not found.</p>
        </div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const completedCount = sessionCompleted ? patient.exercises.length : 0
  const totalExercises = patient.exercises.length
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0
  const level = patient.level || 1
  const levelLabel = LEVEL_LABELS[level] || `Level ${level}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-500 to-teal-600 flex justify-center">
      <div className="w-full max-w-[390px] flex flex-col min-h-screen">
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-teal-100 text-sm">{today}</p>
              <h1 className="text-white text-2xl font-bold mt-0.5">Hi, {patient.name.split(' ')[0]}! 👋</h1>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold text-white">
              {patient.name.charAt(0)}
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="flex-1 bg-slate-50 rounded-t-3xl px-5 pt-6 pb-10 space-y-5">

          {/* Live session banner */}
          {hasLiveSession && (
            <button
              onClick={() => navigate(`/patient/${patientId}/session`)}
              className="w-full flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3.5 rounded-2xl transition-colors shadow-md"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-sm font-bold">Live Session in Progress</p>
                <p className="text-xs text-indigo-200">Your therapist is ready — tap to join</p>
              </div>
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
              <div className="text-2xl font-bold text-teal-600">{patient.xp || 0}</div>
              <div className="text-xs text-slate-500 mt-0.5">XP</div>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
              <div className="text-sm font-bold text-purple-600">{levelLabel}</div>
              <div className="text-xs text-slate-500 mt-0.5">Level {level}</div>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
              <div className="text-2xl font-bold text-amber-500">{patient.streak > 0 ? `${patient.streak}🔥` : '0'}</div>
              <div className="text-xs text-slate-500 mt-0.5">Day Streak</div>
            </div>
          </div>

          {/* Today's Session Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-3">
              <h2 className="text-white font-semibold text-sm">Today's Practice</h2>
              <p className="text-teal-100 text-xs mt-0.5">{totalExercises} exercises · ~10 min</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ProgressRing percent={progressPercent} size={72} stroke={7} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-700">{progressPercent}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  {sessionCompleted ? (
                    <div>
                      <p className="text-sm font-semibold text-emerald-600">Session complete! 🎉</p>
                      <p className="text-xs text-slate-500 mt-1">Great work today.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-slate-700">Ready to practice?</p>
                      <p className="text-xs text-slate-400 mt-0.5">{totalExercises} exercises waiting</p>
                    </div>
                  )}
                  <button
                    onClick={() => navigate(sessionCompleted ? `/patient/${patientId}/session` : `/patient/${patientId}/lesson`)}
                    className={`mt-3 w-full text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors ${
                      sessionCompleted
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {sessionCompleted ? 'Redo Session' : 'Start Session'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Exercise List Preview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Today's Exercises</h3>
            <div className="space-y-2">
              {patient.exercises.map((ex, i) => {
                const typeIcon = ex.type === 'video' ? '🎬' : ex.type === 'quiz' ? '🎤' : '📋'
                return (
                  <div key={ex.id} className="flex items-center gap-3 py-1">
                    <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-sm">
                      {typeIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{ex.title}</p>
                      <p className="text-xs text-slate-400 capitalize">{ex.type}</p>
                    </div>
                    <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                      {i + 1}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Badges */}
          {patient.badges && patient.badges.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Badges Earned</h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {patient.badges.map((badge, i) => (
                  <div key={i} className="shrink-0 flex flex-col items-center gap-1 bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-200 rounded-xl px-3 py-2 min-w-[80px]">
                    <span className="text-xl">🏅</span>
                    <span className="text-xs font-medium text-amber-800 text-center leading-tight">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Check-in CTA if session done */}
          {sessionCompleted && (
            <button
              onClick={() => navigate(`/patient/${patientId}/checkin`)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-colors"
            >
              Submit Check-In for Therapist →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
