import { useState } from 'react'
import { usePatientData } from '../context/PatientDataContext.jsx'
import PatientBrief from '../components/PatientBrief.jsx'
import ExercisePlanGenerator from '../components/ExercisePlanGenerator.jsx'
import ClinicalRAG from '../components/ClinicalRAG.jsx'
import SessionPlanning from '../components/SessionPlanning.jsx'
import SessionView from '../components/SessionView.jsx'
import SoapNote from '../components/SoapNote.jsx'

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

const TOP_TABS = [
  { id: 'brief', label: 'Pre-Session Brief', requiresPatient: true },
  { id: 'planning', label: 'Session Planning', requiresPatient: false },
  { id: 'session', label: 'Session', requiresPatient: false },
  { id: 'soap', label: 'SOAP', requiresPatient: false },
  { id: 'generator', label: 'Exercise Plan', requiresPatient: false },
]

export default function Dashboard() {
  const { patientData } = usePatientData()
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [activePanel, setActivePanel] = useState('brief')

  const selectedPatient = patientData.find(p => p.id === selectedPatientId) || null

  function handleSelectPatient(patient) {
    setSelectedPatientId(patient.id)
    if (activePanel === 'rag') return
    setActivePanel('brief')
  }

  function renderPanel() {
    switch (activePanel) {
      case 'rag':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ClinicalRAG />
          </div>
        )
      case 'generator':
        return (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-8">
              <ExercisePlanGenerator selectedPatientId={selectedPatient?.id} onEnd={() => setActivePanel('brief')} />
            </div>
          </div>
        )
      case 'planning':
        return (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-8">
              <SessionPlanning patient={selectedPatient} onNext={() => setActivePanel('session')} />
            </div>
          </div>
        )
      case 'session':
        return (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-8">
              <SessionView patient={selectedPatient} onNext={() => setActivePanel('soap')} />
            </div>
          </div>
        )
      case 'soap':
        return (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-8">
              <SoapNote patient={selectedPatient} onNext={() => setActivePanel('generator')} />
            </div>
          </div>
        )
      case 'brief':
      default:
        if (!selectedPatient) {
          return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">Select a patient</h3>
              <p className="text-sm text-slate-400 max-w-xs">Choose a patient from your caseload to view their pre-session brief and evaluation outcome.</p>
            </div>
          )
        }
        return (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-8">
              <PatientBrief patient={selectedPatient} onNext={() => setActivePanel('planning')} />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
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
          <span className="text-sm text-slate-500 font-medium">Pediatric SLP</span>
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
            <p className="text-xs text-slate-400 mt-0.5">{patientData.length} active patients</p>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {patientData.map(p => (
              <PatientRow
                key={p.id}
                patient={p}
                isSelected={selectedPatientId === p.id}
                onClick={() => handleSelectPatient(p)}
              />
            ))}
          </div>

          {/* Bottom actions */}
          <div className="p-3 border-t border-slate-100">
            <button
              onClick={() => setActivePanel('rag')}
              className={`w-full flex items-center gap-2 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${activePanel === 'rag' ? 'bg-purple-600 text-white' : 'text-purple-600 hover:bg-purple-50 border border-purple-200'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Clinical Questions
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky tab bar */}
          <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
              {TOP_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  disabled={tab.requiresPatient && !selectedPatient}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${activePanel === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {renderPanel()}
        </main>
      </div>
    </div>
  )
}
