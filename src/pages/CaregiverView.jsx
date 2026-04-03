import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPatientById } from '../data/mockData.js'

function ExerciseCard({ exercise, index, onToggleComplete, onToggleFlag }) {
  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${exercise.completed ? 'border-emerald-200 bg-emerald-50' : exercise.flagged ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
      {/* Card header */}
      <div className={`px-4 py-3 flex items-center gap-3 border-b ${exercise.completed ? 'border-emerald-200 bg-emerald-100/50' : exercise.flagged ? 'border-amber-200 bg-amber-100/50' : 'border-slate-100 bg-slate-50'}`}>
        <button
          onClick={() => onToggleComplete(exercise.id)}
          aria-label={exercise.completed ? 'Mark incomplete' : 'Mark complete'}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all active:scale-95 ${exercise.completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`}
        >
          {exercise.completed && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${exercise.completed ? 'text-emerald-600' : 'text-slate-400'}`}>
              Exercise {index + 1}
            </span>
            {exercise.flagged && (
              <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-medium">Flagged</span>
            )}
          </div>
          <h3 className={`text-sm font-semibold mt-0.5 ${exercise.completed ? 'text-emerald-800 line-through decoration-emerald-400' : 'text-slate-800'}`}>
            {exercise.title}
          </h3>
        </div>
        {exercise.completed && (
          <div className="text-emerald-500 shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        )}
      </div>

      {/* Instruction */}
      <div className="px-4 py-4">
        <p className={`text-sm leading-relaxed ${exercise.completed ? 'text-emerald-700 opacity-70' : 'text-slate-600'}`}>
          {exercise.instruction}
        </p>
      </div>

      {/* Flag as hard */}
      <div className={`px-4 pb-3 border-t ${exercise.completed ? 'border-emerald-200' : exercise.flagged ? 'border-amber-200' : 'border-slate-100'}`}>
        <button
          onClick={() => onToggleFlag(exercise.id)}
          className={`mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors active:scale-95 ${exercise.flagged ? 'text-amber-700' : 'text-slate-400 hover:text-amber-600'}`}
        >
          <svg className="w-3.5 h-3.5" fill={exercise.flagged ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
          {exercise.flagged ? 'Unflag this exercise' : 'Flag as hard'}
        </button>
      </div>
    </div>
  )
}

export default function CaregiverView() {
  const { patientId } = useParams()
  const patient = getPatientById(patientId)

  const [exercises, setExercises] = useState(
    patient?.exercises.map(ex => ({ ...ex, completed: false, flagged: false })) || []
  )

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Patient not found</h2>
          <p className="text-sm text-slate-500 mb-4">We couldn't find a patient with this ID.</p>
          <Link to="/dashboard" className="text-sm text-teal-600 hover:underline">← Back to dashboard</Link>
        </div>
      </div>
    )
  }

  const completedCount = exercises.filter(e => e.completed).length
  const totalCount = exercises.length
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const allDone = completedCount === totalCount

  function toggleComplete(id) {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex))
  }

  function toggleFlag(id) {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, flagged: !ex.flagged } : ex))
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col shadow-xl">
        {/* Status bar area */}
        <div className="bg-teal-600 pt-safe-top">
          {/* App header */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <span className="text-white font-bold text-sm tracking-tight">SpeechOS</span>
              </div>
              <span className="text-teal-200 text-xs font-medium">Home Loop</span>
            </div>

            {/* Patient + date */}
            <div>
              <p className="text-teal-200 text-xs font-medium mb-0.5">{today}</p>
              <h1 className="text-white text-xl font-bold">{patient.name.split(' ')[0]}'s Practice</h1>
              <p className="text-teal-200 text-xs mt-1">{patient.condition}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-teal-100 font-medium">
                {completedCount} of {totalCount} done
              </span>
              {allDone && (
                <span className="text-xs text-teal-100 font-semibold animate-pulse">Great job! 🎉</span>
              )}
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Exercise cards */}
        <div className="flex-1 px-4 py-5 space-y-4 overflow-y-auto">
          {exercises.map((exercise, i) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={i}
              onToggleComplete={toggleComplete}
              onToggleFlag={toggleFlag}
            />
          ))}

          {/* Completion state */}
          {allDone && (
            <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 p-5 text-center text-white mt-2">
              <div className="text-3xl mb-2">🌟</div>
              <h3 className="font-bold text-base mb-1">Practice complete!</h3>
              <p className="text-teal-100 text-sm">All exercises done for today. Your SLP will review your progress at the next session.</p>
            </div>
          )}
        </div>

        {/* Bottom footer */}
        <div className="px-4 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400 text-center">
            Tap the circle on each exercise to mark it complete. Use "Flag as hard" to let your therapist know.
          </p>
        </div>
      </div>
    </div>
  )
}
