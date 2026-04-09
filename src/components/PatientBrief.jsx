import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { generatePatientBrief } from '../api/anthropic.js'

function ComplianceBadge({ value }) {
  if (value >= 80) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      {value}%
    </span>
  )
  if (value >= 50) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      {value}%
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
      {value}%
    </span>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-semibold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

export default function PatientBrief({ patient }) {
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!patient) return
    setBrief('')
    setError(null)
    setLoading(true)

    generatePatientBrief(patient)
      .then(text => setBrief(text))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [patient?.id])

  if (!patient) return null

  const nextSessionDate = new Date(patient.nextSession).toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{patient.name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{patient.condition} · Age {patient.age}</p>
        </div>
        <Link
          to={`/patient/${patient.id}`}
          target="_blank"
          className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-300 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Patient View
        </Link>
      </div>

      {/* Session info */}
      <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
        <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Next session: <span className="font-medium text-blue-700">{nextSessionDate}</span></span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Weekly compliance" value={<ComplianceBadge value={patient.compliance} />} icon="📊" />
        <StatCard label="Day streak" value={patient.streak > 0 ? `${patient.streak} 🔥` : '0'} icon="⚡" />
        <StatCard label="Voice samples" value={patient.voiceSamples} icon="🎙️" />
      </div>

      {/* AI Pre-session Brief */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-teal-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-sm font-semibold text-white">AI Pre-Session Brief</h3>
          <span className="ml-auto text-xs text-teal-200 font-medium">{loading ? 'Generating…' : 'claude-sonnet-4-0'}</span>
        </div>
        <div className="p-4 bg-white min-h-[80px]">
          {loading && (
            <div className="space-y-2 animate-pulse">
              <div className="h-3.5 bg-slate-100 rounded w-full"></div>
              <div className="h-3.5 bg-slate-100 rounded w-5/6"></div>
              <div className="h-3.5 bg-slate-100 rounded w-4/6"></div>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          {!loading && !error && brief && (
            <p className="text-sm text-slate-700 leading-relaxed">{brief}</p>
          )}
        </div>
      </div>

      {/* Flagged Exercises */}
      {patient.flaggedExercises.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
            Flagged as Hard by Caregiver
          </h3>
          <div className="space-y-2">
            {patient.flaggedExercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <span className="text-amber-500">⚑</span>
                {ex}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Questions from last check-in */}
      {patient.patientQuestions && patient.patientQuestions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Patient Questions
            <span className="text-xs font-normal text-blue-400">(from last check-in)</span>
          </h3>
          <div className="space-y-2">
            {patient.patientQuestions.map((q, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-blue-800 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <span className="text-blue-400 shrink-0 mt-0.5">?</span>
                {q}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topics to Cover */}
      {(() => {
        const topics = [
          ...patient.flaggedExercises.map(e => `Review flagged exercise: ${e}`),
          ...(patient.lastCheckIn?.topicsToExplore ? [`Patient wants to explore: ${patient.lastCheckIn.topicsToExplore}`] : []),
        ]
        if (topics.length === 0) return null
        return (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Topics to Cover
            </h3>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-2">
              {topics.map((topic, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-indigo-800">
                  <svg className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {topic}
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Compliance Trend */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">3-Week Compliance Trend</h3>
        <div className="flex items-end gap-3 h-16">
          {patient.history.map((week, i) => {
            const height = Math.max(8, Math.round((week.compliance / 100) * 56))
            const isLast = i === patient.history.length - 1
            const color = week.compliance >= 80 ? 'bg-emerald-400' : week.compliance >= 50 ? 'bg-amber-400' : 'bg-red-400'
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500">{week.compliance}%</span>
                <div className="w-full flex items-end justify-center">
                  <div
                    className={`w-full rounded-t-md transition-all ${color} ${isLast ? 'opacity-100' : 'opacity-60'}`}
                    style={{ height: `${height}px` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{week.week}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
