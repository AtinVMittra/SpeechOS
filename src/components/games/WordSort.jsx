import { useState } from 'react'

export default function WordSort({ exercise }) {
  const categories = exercise.categories || ['Category A', 'Category B']
  const allWords = exercise.words || []

  const [sorted, setSorted] = useState({})   // index → 0 | 1
  const [active, setActive] = useState(null) // index of selected word
  const [revealed, setRevealed] = useState(false)

  const totalSorted = Object.keys(sorted).length
  const allDone = totalSorted === allWords.length

  const correct = allWords.filter((w, i) => {
    if (sorted[i] === undefined) return false
    return categories[sorted[i]] === w.category
  }).length

  function selectWord(i) {
    if (sorted[i] !== undefined || revealed) return
    setActive(active === i ? null : i)
  }

  function placeInCategory(catIdx) {
    if (active === null) return
    setSorted(prev => ({ ...prev, [active]: catIdx }))
    setActive(null)
  }

  function restart() {
    setSorted({})
    setActive(null)
    setRevealed(false)
  }

  if (allWords.length === 0) {
    return <div className="p-6 text-sm text-slate-400 text-center">No words for this exercise.</div>
  }

  const catColors = [
    { base: 'border-violet-200 bg-violet-50', active: 'border-violet-400 bg-violet-100', label: 'text-violet-700', chip: 'bg-violet-100 text-violet-700', correct: 'bg-emerald-100 text-emerald-700', wrong: 'bg-red-100 text-red-600' },
    { base: 'border-amber-200 bg-amber-50', active: 'border-amber-400 bg-amber-100', label: 'text-amber-700', chip: 'bg-amber-100 text-amber-700', correct: 'bg-emerald-100 text-emerald-700', wrong: 'bg-red-100 text-red-600' },
  ]

  const unsorted = allWords.filter((_, i) => sorted[i] === undefined)

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {totalSorted}/{allWords.length} sorted
          {revealed && <span className="ml-2 font-semibold text-teal-600">{correct}/{allWords.length} correct</span>}
        </span>
        <div className="flex gap-2">
          {allDone && !revealed && (
            <button
              onClick={() => setRevealed(true)}
              className="text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Check
            </button>
          )}
          {revealed && (
            <button onClick={restart} className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline">
              Play Again
            </button>
          )}
        </div>
      </div>

      {/* Word bank */}
      {unsorted.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Word Bank — tap a word, then tap its category</p>
          <div className="flex flex-wrap gap-2">
            {allWords.map((w, i) => {
              if (sorted[i] !== undefined) return null
              const isActive = active === i
              return (
                <button
                  key={i}
                  onClick={() => selectWord(i)}
                  className={`text-sm font-semibold px-3 py-1.5 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white border-teal-600 scale-105'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  {w.word}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Category drop zones */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat, catIdx) => {
          const c = catColors[catIdx] || catColors[0]
          const wordsHere = allWords.filter((_, i) => sorted[i] === catIdx)
          const canDrop = active !== null && !revealed

          return (
            <button
              key={catIdx}
              onClick={() => canDrop && placeInCategory(catIdx)}
              className={`min-h-[110px] border-2 rounded-2xl p-3 text-left transition-all ${
                canDrop ? `${c.active} cursor-pointer` : `${c.base} cursor-default`
              }`}
            >
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${c.label}`}>{cat}</p>
              <div className="flex flex-wrap gap-1.5">
                {wordsHere.map((w, j) => {
                  const isCorrect = w.category === cat
                  return (
                    <span
                      key={j}
                      className={`text-sm px-2 py-1 rounded-lg font-semibold transition-colors ${
                        revealed
                          ? isCorrect ? c.correct : c.wrong
                          : c.chip
                      }`}
                    >
                      {w.word}
                      {revealed && (isCorrect ? ' ✓' : ' ✗')}
                    </span>
                  )
                })}
                {canDrop && wordsHere.length === 0 && (
                  <span className={`text-xs italic ${c.label} opacity-60`}>drop here</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
