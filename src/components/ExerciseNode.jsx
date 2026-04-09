import { useState } from 'react'

const TYPE_OPTIONS = ['exercise', 'video', 'quiz']
const TYPE_LABELS = { exercise: 'Exercise', video: 'Video', quiz: 'Quiz' }
const TYPE_ICONS = { exercise: '📋', video: '🎬', quiz: '🎤' }

function VideoPreview({ title }) {
  return (
    <div className="aspect-video bg-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400">
      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
        <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
      </div>
      <p className="text-xs">Video: {title}</p>
    </div>
  )
}

function QuizPreview({ title }) {
  return (
    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
      <p className="text-xs font-semibold text-purple-600 mb-2">Voice Quiz</p>
      <p className="text-sm text-slate-700">Say this word aloud:</p>
      <p className="text-xl font-bold text-slate-800 mt-2 text-center py-2">{title.split(' ')[0]}</p>
      <div className="flex items-center justify-center mt-2 gap-1.5">
        <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <span className="text-xs text-slate-400">Mic grading</span>
      </div>
    </div>
  )
}

export default function ExerciseNode({ exercise, index, onTypeChange }) {
  const [type, setType] = useState(exercise.type || 'exercise')

  function handleChange(e) {
    const newType = e.target.value
    setType(newType)
    onTypeChange(exercise.id, newType)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Node header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
        <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <h4 className="text-sm font-semibold text-slate-800 flex-1">{exercise.title}</h4>
        {/* Type dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{TYPE_ICONS[type]}</span>
          <select
            value={type}
            onChange={handleChange}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            {TYPE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{TYPE_LABELS[opt]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content preview */}
      <div className="p-4">
        {type === 'video' && <VideoPreview title={exercise.title} />}
        {type === 'quiz' && <QuizPreview title={exercise.title} />}
        {type === 'exercise' && (
          <p className="text-sm text-slate-600 leading-relaxed">{exercise.instruction}</p>
        )}
      </div>
    </div>
  )
}
