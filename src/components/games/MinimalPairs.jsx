import { useState, useCallback } from 'react'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function MinimalPairs({ exercise }) {
  const pairs = exercise.pairs || []

  // Each trial: show the pair, therapist picks which word to "say", patient taps it
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState([])
  const [saidSide, setSaidSide] = useState(() => Math.random() > 0.5 ? 'target' : 'foil')
  const [chosen, setChosen] = useState(null)
  const [done, setDone] = useState(false)

  const pair = pairs[index]
  const correct = results.filter(r => r).length

  const advance = useCallback((chosenSide) => {
    if (chosen !== null) return
    setChosen(chosenSide)
    const isCorrect = chosenSide === saidSide
    setTimeout(() => {
      const next = [...results, isCorrect]
      setResults(next)
      setChosen(null)
      if (index + 1 >= pairs.length) {
        setDone(true)
      } else {
        setIndex(i => i + 1)
        setSaidSide(Math.random() > 0.5 ? 'target' : 'foil')
      }
    }, 800)
  }, [chosen, saidSide, results, index, pairs.length])

  function restart() {
    setIndex(0)
    setResults([])
    setSaidSide(Math.random() > 0.5 ? 'target' : 'foil')
    setChosen(null)
    setDone(false)
  }

  if (pairs.length === 0) {
    return <div className="p-6 text-sm text-slate-400 text-center">No pairs for this exercise.</div>
  }

  if (done) {
    const accuracy = Math.round((correct / pairs.length) * 100)
    const color = accuracy >= 80 ? 'text-emerald-500' : accuracy >= 60 ? 'text-amber-500' : 'text-red-500'
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-center min-h-[280px]">
        <div className={`text-5xl font-bold ${color}`}>{accuracy}%</div>
        <p className="text-sm text-slate-500">{correct} / {pairs.length} pairs correct</p>
        <div className="flex gap-1 flex-wrap justify-center">
          {results.map((r, i) => (
            <span key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${r ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
              {r ? '✓' : '✗'}
            </span>
          ))}
        </div>
        <button onClick={restart} className="mt-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition-colors">
          Play Again
        </button>
      </div>
    )
  }

  const saidWord = saidSide === 'target' ? pair.target : pair.foil

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Progress */}
      <div className="w-full flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-400 rounded-full transition-all duration-300" style={{ width: `${(index / pairs.length) * 100}%` }} />
        </div>
        <span className="text-xs text-slate-400 tabular-nums">{index + 1}/{pairs.length}</span>
      </div>

      {/* Therapist says */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl px-4 py-4 text-center">
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Therapist says</p>
        <p className="text-3xl font-bold text-blue-800">"{saidWord}"</p>
        {pair.targetSound && (
          <p className="text-xs text-blue-400 mt-1.5">Focus: {pair.targetSound}</p>
        )}
      </div>

      <p className="text-xs text-center text-slate-400 font-medium">Patient — tap the word you heard</p>

      {/* Word pair buttons */}
      <div className="grid grid-cols-2 gap-3">
        {(['target', 'foil'] ).map(side => {
          const word = side === 'target' ? pair.target : pair.foil
          const isCorrectSide = side === saidSide

          let cls = 'rounded-2xl py-7 flex items-center justify-center text-2xl font-bold border-2 transition-all duration-150 select-none '
          if (chosen === null) {
            cls += 'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50 cursor-pointer active:scale-95'
          } else if (chosen === side) {
            cls += isCorrectSide
              ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
              : 'bg-red-50 border-red-400 text-red-600'
          } else {
            cls += 'bg-white border-slate-100 text-slate-300 cursor-default'
          }

          return (
            <button key={side} onClick={() => advance(side)} className={cls}>
              {word}
            </button>
          )
        })}
      </div>

      {results.length > 0 && (
        <p className="text-xs text-slate-400 text-center">{correct}/{results.length} correct</p>
      )}
    </div>
  )
}
