import { useState } from 'react'
import { patients } from '../data/mockData.js'
import PatientBrief from '../components/PatientBrief.jsx'
import ExercisePlanGenerator from '../components/ExercisePlanGenerator.jsx'

function ComplianceBadge({ value }) {
  if (value >= 80) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{value}%
    </span>
  )
  if (value >= 50) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{value}%
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{value}%
    </span>
  )
}

function PatientRow({ patient, isSelected, onClick }) {
  const nextDate = new Date(patient.nextSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors focus:outline-none ${isSelected ? 'bg-teal-50 border-l-2 border-l-teal-500' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {patient.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">{patient.name}</div>
            <div className="text-xs text-slate-500 truncate">Age {patient.age} · {patient.condition.split('(')[0].trim()}</div>
          </div>
        </div>
        <ComplianceBadge value={patient.compliance} />
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-400 pl-[calc(2rem+0.625rem)]">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Next session {nextDate}
        {patient.streak > 0 && (
          <span className="ml-2 text-amber-500">🔥 {patient.streak}d streak</span>
        )}
      </div>
    </button>
  )
}

export default function Dashboard() {
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [activePanel, setActivePanel] = useState('brief') // 'brief' | 'generator'

  function handleSelectPatient(patient) {
    setSelectedPatient(patient)
    setActivePanel('brief')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Nav */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="font-bold text-slate-900 tracking-tight">SpeechOS</span>
          <span className="text-slate-300">·</span>
          <span className="text-sm text-slate-500 font-medium">Home Loop</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            SLP Dashboard
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar — Caseload */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Caseload</h2>
            <p className="text-xs text-slate-400 mt-0.5">{patients.length} active patients</p>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {patients.map(p => (
              <PatientRow
                key={p.id}
                patient={p}
                isSelected={selectedPatient?.id === p.id}
                onClick={() => handleSelectPatient(p)}
              />
            ))}
          </div>

          {/* Bottom action */}
          <div className="p-3 border-t border-slate-100">
            <button
              onClick={() => { setSelectedPatient(null); setActivePanel('generator') }}
              className={`w-full flex items-center gap-2 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${activePanel === 'generator' && !selectedPatient ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50 border border-blue-200'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Exercise Plan Generator
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {!selectedPatient && activePanel !== 'generator' ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">Select a patient</h3>
              <p className="text-sm text-slate-400 max-w-xs">Choose a patient from your caseload to view their pre-session brief, or use the Exercise Plan Generator to create a new home practice plan.</p>
            </div>
          ) : activePanel === 'generator' ? (
            <div className="max-w-2xl mx-auto p-8">
              <ExercisePlanGenerator selectedPatientId={selectedPatient?.id} />
            </div>
          ) : (
            /* Patient brief + tabs */
            <div className="max-w-2xl mx-auto p-8">
              {/* Tab switcher */}
              <div className="flex items-center gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
                <button
                  onClick={() => setActivePanel('brief')}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${activePanel === 'brief' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Pre-Session Brief
                </button>
                <button
                  onClick={() => setActivePanel('generator')}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${activePanel === 'generator' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Exercise Generator
                </button>
              </div>

              {activePanel === 'brief' ? (
                <PatientBrief patient={selectedPatient} />
              ) : (
                <ExercisePlanGenerator selectedPatientId={selectedPatient?.id} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
