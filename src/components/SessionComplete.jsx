import { useNavigate } from 'react-router-dom'

const CONFETTI_COLORS = ['#0d9488', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899']

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 w-2.5 h-2.5 rounded-sm"
          style={{
            left: `${(i / 16) * 100 + Math.random() * 6}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `confettiFall ${2 + Math.random() * 1.5}s ease-in forwards`,
            animationDelay: `${Math.random() * 0.8}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function SessionComplete({ patientId, totalXp, badgeUnlocked, completedExercises }) {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-teal-500 to-emerald-600 flex flex-col items-center justify-center z-40 text-center px-6">
      <Confetti />
      <div className="relative z-10 space-y-5 max-w-[320px] w-full">
        {/* Trophy */}
        <div
          className="text-7xl"
          style={{ animation: 'celebrationPulse 1s ease-in-out infinite' }}
        >
          🏆
        </div>

        <div>
          <h1 className="text-3xl font-black text-white">Session Complete!</h1>
          <p className="text-teal-100 text-sm mt-1">Amazing work — you crushed it today!</p>
        </div>

        {/* XP Badge */}
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4">
          <p className="text-teal-100 text-xs font-medium uppercase tracking-wider">XP Earned</p>
          <p className="text-4xl font-black text-white mt-1">+{totalXp}</p>
        </div>

        {/* Badge unlocked */}
        {badgeUnlocked && (
          <div className="bg-amber-400/20 border border-amber-300/40 rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🏅</span>
            <div className="text-left">
              <p className="text-xs text-amber-200 font-medium">Badge Unlocked!</p>
              <p className="text-sm font-bold text-white">{badgeUnlocked}</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate(`/patient/${patientId}/checkin`, {
              state: { completedExercises, totalXp }
            })}
            className="w-full bg-white text-teal-700 font-bold text-sm py-3.5 rounded-2xl hover:bg-teal-50 transition-colors shadow-lg"
          >
            Submit Check-In for Therapist →
          </button>
          <button
            onClick={() => navigate(`/patient/${patientId}`, {
              state: { sessionCompleted: true }
            })}
            className="w-full bg-white/20 text-white font-medium text-sm py-3 rounded-2xl hover:bg-white/30 transition-colors border border-white/30"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
