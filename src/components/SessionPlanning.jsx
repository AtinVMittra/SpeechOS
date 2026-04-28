import { useState } from 'react'
import { generateSessionPlan } from '../api/anthropic.js'
import { usePatientData } from '../context/PatientDataContext.jsx'

const PHASE_COLORS = {
  'Warm-Up': 'bg-amber-50 border-amber-200 text-amber-800',
  'Targeted Drill': 'bg-teal-50 border-teal-200 text-teal-800',
  'Generalization Activity': 'bg-blue-50 border-blue-200 text-blue-800',
  'Wrap-Up': 'bg-slate-50 border-slate-200 text-slate-700',
}

const PHASE_BADGE = {
  'Warm-Up': 'bg-amber-100 text-amber-700',
  'Targeted Drill': 'bg-teal-100 text-teal-700',
  'Generalization Activity': 'bg-blue-100 text-blue-700',
  'Wrap-Up': 'bg-slate-100 text-slate-600',
}

function BlockCard({ block, onChange }) {
  return (
    <div className={`border rounded-xl p-4 space-y-2 ${PHASE_COLORS[block.phase] || 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PHASE_BADGE[block.phase] || 'bg-slate-100 text-slate-600'}`}>
          {block.phase}
        </span>
        <span className="text-xs text-slate-500">{block.durationMinutes} min</span>
      </div>
      <input
        className="w-full text-sm font-medium bg-transparent border-0 border-b border-dashed border-current/30 focus:outline-none focus:border-current/60 py-0.5"
        value={block.activity}
        onChange={e => onChange({ ...block, activity: e.target.value })}
      />
      <textarea
        className="w-full text-sm bg-transparent border border-dashed border-current/20 rounded-lg p-2 focus:outline-none focus:border-current/50 resize-none"
        rows={2}
        value={block.description}
        onChange={e => onChange({ ...block, description: e.target.value })}
      />
      {block.materials && (
        <p className="text-xs opacity-70">
          <span className="font-medium">Materials:</span> {block.materials}
        </p>
      )}
    </div>
  )
}

function ExerciseCard({ exercise, index }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-slate-800">{exercise.title}</span>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{exercise.targetTrials} trials</span>
          <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full">{exercise.targetAccuracy}</span>
        </div>
      </div>
      <p className="text-sm text-slate-600 pl-8">{exercise.instructions}</p>
      {exercise.materials && (
        <p className="text-xs text-slate-400 pl-8">
          <span className="font-medium text-slate-500">Materials:</span> {exercise.materials}
        </p>
      )}
      {exercise.ageNote && (
        <p className="text-xs text-indigo-500 pl-8 italic">{exercise.ageNote}</p>
      )}
    </div>
  )
}

export default function SessionPlanning({ patient }) {
  const { saveSessionPlan } = usePatientData()
  const [focus, setFocus] = useState('')
  const [plan, setPlan] = useState(patient?.sessionPlan || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(!!patient?.sessionPlan)

  async function handleGenerate() {
    if (!focus.trim()) return
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const result = await generateSessionPlan(patient, focus)
      setPlan(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleBlockChange(index, updated) {
    setPlan(prev => ({
      ...prev,
      blocks: prev.blocks.map((b, i) => (i === index ? updated : b)),
    }))
    setSaved(false)
  }

  function handleSave() {
    if (!plan) return
    saveSessionPlan(patient.id, plan)
    setSaved(true)
  }

  if (!patient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-1">Select a patient first</h3>
        <p className="text-sm text-slate-400 max-w-xs">Choose a patient from your caseload to generate a session plan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Session Planning</h2>
        <p className="text-sm text-slate-500 mt-0.5">{patient.name} · Age {patient.age} · {patient.condition}</p>
      </div>

      {/* Focus input */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
        <label className="text-sm font-semibold text-slate-700 block">What do you want to focus on today?</label>
        <textarea
          className="w-full text-sm border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
          rows={3}
          placeholder={`e.g. "Work on /s/ blends in initial position, plus 5 minutes of narrative retell with picture support."`}
          value={focus}
          onChange={e => setFocus(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !focus.trim()}
          className="flex items-center gap-2 text-sm font-medium bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Plan
            </>
          )}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* Generated plan */}
      {plan && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Generated Plan</h3>
              <p className="text-xs text-slate-500 mt-0.5">{plan.sessionFocus}</p>
            </div>
            <div className="flex items-center gap-2">
              {saved && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </span>
              )}
              <button
                onClick={handleSave}
                className="text-sm font-medium bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-lg transition-colors"
              >
                Save Plan
              </button>
            </div>
          </div>

          {/* Time blocks */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Session Structure · {plan.totalDurationMinutes} min total
            </h4>
            <div className="space-y-3">
              {plan.blocks?.map((block, i) => (
                <BlockCard key={i} block={block} onChange={updated => handleBlockChange(i, updated)} />
              ))}
            </div>
          </div>

          {/* Exercises */}
          {plan.exercises?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Exercises
              </h4>
              <div className="space-y-3">
                {plan.exercises.map((ex, i) => (
                  <ExerciseCard key={ex.id || i} exercise={ex} index={i} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
