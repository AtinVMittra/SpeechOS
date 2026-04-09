import { useState, useRef, useCallback } from 'react'
import { generateExercisePlan } from '../api/anthropic.js'
import { synthesizeSpeech } from '../api/elevenlabs.js'
import { Link } from 'react-router-dom'
import WorkflowDiagram from './WorkflowDiagram.jsx'

// ─── AudioButton ──────────────────────────────────────────────────────────────
function AudioButton({ state, onPress }) {
  const isLoading = state === 'loading'
  const isPlaying = state === 'playing'
  const isError   = state === 'error'

  const label = isLoading ? 'Loading audio…'
              : isPlaying ? 'Stop'
              : isError   ? 'Retry audio'
              : 'Listen'

  return (
    <button
      onClick={onPress}
      disabled={isLoading}
      title={label}
      className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
        isPlaying
          ? 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700'
          : isError
          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      }`}
    >
      {isLoading ? (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : isPlaying ? (
        // Stop icon
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <rect x="5" y="5" width="10" height="10" rx="1" />
        </svg>
      ) : (
        // Play icon
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
      )}
      {label}
    </button>
  )
}

const EXAMPLE_NOTE =
  'Patient demonstrated improved /r/ production in isolation and CV syllables. Still inconsistent in words, especially word-final position. Caregiver reports they practice 15 minutes nightly. Recommend continuing isolation practice and introducing /r/ in CVC words. Patient responds well to auditory feedback.'

export default function ExercisePlanGenerator({ selectedPatientId }) {
  const [sessionNote, setSessionNote] = useState('')
  const [exercises, setExercises] = useState(null)
  const [exercisesWithTypes, setExercisesWithTypes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  // audioState: { [exerciseId]: 'idle' | 'loading' | 'playing' | 'error' }
  const [audioState, setAudioState] = useState({})
  const [audioError, setAudioError] = useState(null)
  const audioRef = useRef(null) // currently playing Audio instance

  async function handleGenerate() {
    if (!sessionNote.trim()) return
    setLoading(true)
    setError(null)
    setExercises(null)

    try {
      const result = await generateExercisePlan(sessionNote.trim())
      setExercises(result)
      setExercisesWithTypes(result.map(ex => ({ ...ex, type: 'exercise' })))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function stopCurrent() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  async function handlePlay(ex) {
    const state = audioState[ex.id]

    // If this exercise is playing, stop it
    if (state === 'playing') {
      stopCurrent()
      setAudioState(s => ({ ...s, [ex.id]: 'idle' }))
      return
    }

    // Stop any currently playing exercise
    stopCurrent()
    setAudioState(s => {
      const next = {}
      for (const k of Object.keys(s)) next[k] = 'idle'
      return { ...next, [ex.id]: 'loading' }
    })

    try {
      const url = await synthesizeSpeech(ex.instruction)
      const audio = new Audio(url)
      audioRef.current = audio
      setAudioState(s => ({ ...s, [ex.id]: 'playing' }))
      audio.play()
      audio.onended = () => {
        URL.revokeObjectURL(url)
        setAudioState(s => ({ ...s, [ex.id]: 'idle' }))
        audioRef.current = null
      }
    } catch (err) {
      setAudioState(s => ({ ...s, [ex.id]: 'error' }))
      setAudioError(err.message)
    }
  }

  const handleTypeChange = useCallback((id, newType) => {
    setExercisesWithTypes(prev => prev.map(ex => ex.id === id ? { ...ex, type: newType } : ex))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Exercise Plan Generator</h2>
        <p className="text-sm text-slate-500 mt-1">Paste your session notes and generate a structured 3-exercise home practice plan for the caregiver.</p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          Session Note
        </label>
        <textarea
          value={sessionNote}
          onChange={e => setSessionNote(e.target.value)}
          rows={7}
          placeholder={`Paste your session notes here…\n\nExample: "${EXAMPLE_NOTE.slice(0, 80)}…"`}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none bg-white leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSessionNote(EXAMPLE_NOTE)}
            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
          >
            Use example note
          </button>
          <span className="text-xs text-slate-400">{sessionNote.length} chars</span>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !sessionNote.trim()}
        className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-medium text-sm px-4 py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating exercises…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate 3 Daily Exercises
          </>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
          <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {audioError && (
        <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
          <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Audio error: {audioError}</span>
        </div>
      )}

      {exercises && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-bold">✓</span>
              Generated Home Practice Plan
            </h3>
            {selectedPatientId && (
              <Link
                to={`/patient/${selectedPatientId}`}
                target="_blank"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
              >
                Preview in Patient View →
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {exercises.map((ex, i) => (
              <div key={ex.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-800 flex-1">{ex.title}</h4>
                  <AudioButton state={audioState[ex.id] || 'idle'} onPress={() => handlePlay(ex)} />
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-slate-600 leading-relaxed">{ex.instruction}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Generated by claude-sonnet-4-0 · Audio by ElevenLabs · Always review before sharing with caregiver
          </div>

          {/* Workflow Diagram */}
          {exercisesWithTypes && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <WorkflowDiagram
                exercises={exercisesWithTypes}
                onTypeChange={handleTypeChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
