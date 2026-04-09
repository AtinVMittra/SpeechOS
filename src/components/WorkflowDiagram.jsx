import { useState, useCallback } from 'react'
import ExerciseNode from './ExerciseNode.jsx'

function Connector() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-0.5 h-4 bg-slate-300 rounded-full" />
        <div className="w-2 h-2 rounded-full border-2 border-slate-300 bg-white" />
        <div className="w-0.5 h-4 bg-slate-300 rounded-full" />
      </div>
    </div>
  )
}

export default function WorkflowDiagram({ exercises, onTypeChange }) {
  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-bold">⬡</div>
        <h3 className="text-sm font-semibold text-slate-700">Exercise Workflow</h3>
        <span className="text-xs text-slate-400 ml-1">— drag the dropdowns to change exercise type</span>
      </div>

      {exercises.map((ex, i) => (
        <div key={ex.id}>
          <ExerciseNode
            exercise={ex}
            index={i}
            onTypeChange={onTypeChange}
          />
          {i < exercises.length - 1 && <Connector />}
        </div>
      ))}
    </div>
  )
}
