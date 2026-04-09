import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { usePatientData } from '../context/PatientDataContext.jsx'

export default function CheckIn() {
  const { patientId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { getPatientById, submitCheckIn } = usePatientData()

  const patient = getPatientById(patientId)
  const { completedExercises = [], totalXp = 0 } = location.state || {}

  const [rating, setRating] = useState(null)
  const [hardExercises, setHardExercises] = useState([])
  const [questions, setQuestions] = useState('')
  const [topicsToExplore, setTopicsToExplore] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Patient not found.</p>
      </div>
    )
  }

  function toggleHard(exercise) {
    setHardExercises(prev =>
      prev.includes(exercise) ? prev.filter(e => e !== exercise) : [...prev, exercise]
    )
  }

  function handleSubmit() {
    const today = new Date().toISOString().split('T')[0]
    submitCheckIn(patientId, {
      date: today,
      rating: rating || 3,
      hardExercises,
      questions: questions.split('\n').map(q => q.trim()).filter(Boolean),
      topicsToExplore,
      xpEarned: totalXp,
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center">
        <div className="w-full max-w-[390px] flex flex-col items-center justify-center px-6 py-12 text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl">
            ✅
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Check-In Submitted!</h1>
            <p className="text-sm text-slate-500 mt-2">Your therapist will review your feedback before your next session.</p>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4 w-full">
            <p className="text-sm text-teal-700 font-medium">Keep up the great work! 🌟</p>
            <p className="text-xs text-teal-500 mt-1">Total XP earned today: +{totalXp}</p>
          </div>
          <button
            onClick={() => navigate(`/patient/${patientId}`, { state: { sessionCompleted: true } })}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm py-3.5 rounded-2xl transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-[390px] flex flex-col">

        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-slate-400">Session Check-In</p>
            <p className="text-sm font-semibold text-slate-800">{patient.name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Rating */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">How did your session go?</h3>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-transform hover:scale-110 ${
                    rating && star <= rating ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            {rating && (
              <p className="text-xs text-center text-slate-400 mt-2">
                {rating === 5 ? 'Amazing!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Tough' : 'Hard day'}
              </p>
            )}
          </div>

          {/* Hard exercises */}
          {completedExercises.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Any exercises that were hard?</h3>
              <p className="text-xs text-slate-400 mb-3">Select all that apply — your therapist will review.</p>
              <div className="space-y-2">
                {completedExercises.map((ex, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        hardExercises.includes(ex)
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-slate-300'
                      }`}
                      onClick={() => toggleHard(ex)}
                    >
                      {hardExercises.includes(ex) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-slate-700">{ex}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Any questions for your therapist?</h3>
            <p className="text-xs text-slate-400 mb-3">One per line — they'll address these in your next session.</p>
            <textarea
              value={questions}
              onChange={e => setQuestions(e.target.value)}
              rows={3}
              placeholder="e.g. Why does my tongue go forward?"
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Topics to explore */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Anything you'd like to explore more?</h3>
            <p className="text-xs text-slate-400 mb-3">Topics, activities, or things you're curious about.</p>
            <textarea
              value={topicsToExplore}
              onChange={e => setTopicsToExplore(e.target.value)}
              rows={3}
              placeholder="e.g. Mirror exercises to do at home"
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm py-3.5 rounded-2xl transition-colors"
          >
            Submit Check-In
          </button>

          <button
            onClick={() => navigate(`/patient/${patientId}`, { state: { sessionCompleted: true } })}
            className="w-full text-slate-400 text-sm py-2 text-center hover:text-slate-600 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
