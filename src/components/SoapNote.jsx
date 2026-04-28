import { useState } from 'react'
import { usePatientData } from '../context/PatientDataContext.jsx'

const SOAP_FIELDS = [
  {
    key: 'subjective',
    label: 'S — Subjective',
    description: 'Patient/parent reported information',
    color: 'blue',
  },
  {
    key: 'objective',
    label: 'O — Objective',
    description: 'Measurable observations, trials, accuracy %',
    color: 'teal',
  },
  {
    key: 'assessment',
    label: 'A — Assessment',
    description: 'Clinical interpretation and progress toward goal',
    color: 'violet',
  },
  {
    key: 'plan',
    label: 'P — Plan',
    description: 'Next session focus, homework, referrals',
    color: 'amber',
  },
]

const COLOR_MAP = {
  blue: {
    header: 'bg-blue-50 border-blue-200',
    label: 'text-blue-700',
    desc: 'text-blue-500',
    border: 'border-blue-200 focus:ring-blue-400',
  },
  teal: {
    header: 'bg-teal-50 border-teal-200',
    label: 'text-teal-700',
    desc: 'text-teal-500',
    border: 'border-teal-200 focus:ring-teal-400',
  },
  violet: {
    header: 'bg-violet-50 border-violet-200',
    label: 'text-violet-700',
    desc: 'text-violet-500',
    border: 'border-violet-200 focus:ring-violet-400',
  },
  amber: {
    header: 'bg-amber-50 border-amber-200',
    label: 'text-amber-700',
    desc: 'text-amber-500',
    border: 'border-amber-200 focus:ring-amber-400',
  },
}

function SoapField({ field, value, onChange, locked }) {
  const c = COLOR_MAP[field.color]
  return (
    <div className={`border rounded-xl overflow-hidden ${c.header}`}>
      <div className={`px-4 py-2.5 border-b ${c.header}`}>
        <p className={`text-sm font-semibold ${c.label}`}>{field.label}</p>
        <p className={`text-xs ${c.desc}`}>{field.description}</p>
      </div>
      <textarea
        className={`w-full text-sm p-4 bg-white focus:outline-none focus:ring-2 resize-none ${c.border} ${locked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
        rows={4}
        value={value}
        onChange={e => !locked && onChange(e.target.value)}
        readOnly={locked}
        placeholder={locked ? '' : `Enter ${field.label.split(' — ')[1]} notes…`}
      />
    </div>
  )
}

function NoteCard({ note, patientId }) {
  const { updateSoapNote, submitSoapNote, amendSoapNote } = usePatientData()
  const [fields, setFields] = useState({
    subjective: note.subjective || '',
    objective: note.objective || '',
    assessment: note.assessment || '',
    plan: note.plan || '',
  })
  const [dirty, setDirty] = useState(false)
  const locked = note.status === 'submitted'

  function handleChange(key, value) {
    setFields(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  function handleSaveDraft() {
    updateSoapNote(patientId, note.id, { ...fields, status: 'draft' })
    setDirty(false)
  }

  function handleSubmit() {
    updateSoapNote(patientId, note.id, { ...fields })
    submitSoapNote(patientId, note.id)
    setDirty(false)
  }

  function handleAmend() {
    amendSoapNote(patientId, note.id)
  }

  const createdAt = new Date(note.createdAt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
      {/* Note header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">SOAP Note</span>
          <span className="text-xs text-slate-400">{createdAt}</span>
        </div>
        <div className="flex items-center gap-2">
          {locked ? (
            <>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Submitted
              </span>
              {note.submittedAt && (
                <span className="text-xs text-slate-400">
                  {new Date(note.submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              )}
              <button
                onClick={handleAmend}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Amend
              </button>
            </>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Draft
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {SOAP_FIELDS.map(field => (
          <SoapField
            key={field.key}
            field={field}
            value={fields[field.key]}
            onChange={val => handleChange(field.key, val)}
            locked={locked}
          />
        ))}

        {!locked && (
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSaveDraft}
              disabled={!dirty}
              className="flex items-center gap-2 text-sm font-medium border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Draft
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submit
            </button>
            {!dirty && (
              <span className="text-xs text-slate-400 italic">All changes saved</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SoapNote({ patient, onNext }) {
  const notes = patient?.soapNotes || []

  if (!patient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-1">Select a patient first</h3>
        <p className="text-sm text-slate-400 max-w-xs">Choose a patient from your caseload to view or edit their SOAP notes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">SOAP Notes</h2>
          <p className="text-sm text-slate-500 mt-0.5">{patient.name} · Age {patient.age} · {patient.condition}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
          {onNext && (
            <button
              onClick={onNext}
              className="inline-flex items-center gap-2 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Next: Exercise Plan
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium text-slate-500 mb-1">No SOAP notes yet</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Run a session and click "Structure as SOAP Note" in the Session tab to auto-generate a note from the session transcript.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...notes].reverse().map(note => (
            <NoteCard key={note.id} note={note} patientId={patient.id} />
          ))}
        </div>
      )}

    </div>
  )
}
