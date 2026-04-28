import { useState } from 'react'

function ScoreRow({ scores }) {
  return (
    <div className="flex gap-1 flex-wrap justify-center">
      {scores.map((s, i) => (
        <span
          key={i}
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            s === 'correct' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
          }`}
        >
          {s === 'correct' ? '✓' : '✗'}
        </span>
      ))}
    </div>
  )
}

export default function FlashcardDrill({ exercise }) {
  const cards = exercise.cards || []
  const [index, setIndex] = useState(0)
  const [scores, setScores] = useState([])
  const [hintVisible, setHintVisible] = useState(false)
  const [done, setDone] = useState(false)

  const card = cards[index]
  const correct = scores.filter(s => s === 'correct').length

  function mark(result) {
    const next = [...scores, result]
    setScores(next)
    setHintVisible(false)
    if (index + 1 >= cards.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  function restart() {
    setIndex(0)
    setScores([])
    setHintVisible(false)
    setDone(false)
  }

  if (cards.length === 0) {
    return <div className="p-6 text-sm text-slate-400 text-center">No cards for this exercise.</div>
  }

  if (done) {
    const accuracy = Math.round((correct / cards.length) * 100)
    const color = accuracy >= 80 ? 'text-emerald-500' : accuracy >= 60 ? 'text-amber-500' : 'text-red-500'
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-center min-h-[280px]">
        <div className={`text-5xl font-bold ${color}`}>{accuracy}%</div>
        <p className="text-sm text-slate-500">{correct} / {cards.length} correct</p>
        <ScoreRow scores={scores} />
        <button
          onClick={restart}
          className="mt-2 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl transition-colors"
        >
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Progress bar */}
      <div className="w-full flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-400 rounded-full transition-all duration-300"
            style={{ width: `${(index / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 tabular-nums">{index + 1}/{cards.length}</span>
      </div>

      {/* Card */}
      <button
        onClick={() => setHintVisible(v => !v)}
        className="w-full bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-200 hover:border-teal-400 rounded-2xl flex flex-col items-center justify-center gap-2 py-8 transition-colors select-none cursor-pointer"
      >
        {card.emoji && <span className="text-5xl leading-none">{card.emoji}</span>}
        <span className="text-3xl font-bold text-slate-800 tracking-wide mt-1">{card.word}</span>
        {card.targetSound && (
          <span className="text-xs text-teal-600 font-semibold px-2 py-0.5 bg-teal-100 rounded-full">
            {card.targetSound}
          </span>
        )}
        <div className="h-5 mt-1">
          {hintVisible && card.hint
            ? <span className="text-xs text-slate-500 italic">{card.hint}</span>
            : <span className="text-xs text-slate-300">tap for hint</span>
          }
        </div>
      </button>

      {/* Mark buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={() => mark('incorrect')}
          className="flex-1 py-3 rounded-xl bg-red-50 border-2 border-red-200 hover:bg-red-100 hover:border-red-300 text-red-600 font-bold text-sm transition-colors active:scale-95"
        >
          ✗ Incorrect
        </button>
        <button
          onClick={() => mark('correct')}
          className="flex-1 py-3 rounded-xl bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-700 font-bold text-sm transition-colors active:scale-95"
        >
          ✓ Correct
        </button>
      </div>

      {scores.length > 0 && (
        <p className="text-xs text-slate-400">{correct}/{scores.length} correct so far</p>
      )}
    </div>
  )
}
