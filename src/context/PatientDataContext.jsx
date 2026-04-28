import { createContext, useContext, useState } from 'react'
import { patients } from '../data/mockData.js'

const PatientDataContext = createContext(null)

export function PatientDataProvider({ children }) {
  const [patientData, setPatientData] = useState(patients)

  function submitCheckIn(patientId, checkInData) {
    setPatientData(prev => prev.map(p =>
      p.id === patientId
        ? {
            ...p,
            lastCheckIn: checkInData,
            patientQuestions: checkInData.questions || [],
            xp: (p.xp || 0) + (checkInData.xpEarned || 0),
            flaggedExercises: checkInData.hardExercises.length > 0
              ? checkInData.hardExercises
              : p.flaggedExercises,
          }
        : p
    ))
  }

  function saveSessionPlan(patientId, plan) {
    setPatientData(prev => prev.map(p =>
      p.id === patientId ? { ...p, sessionPlan: plan } : p
    ))
  }

  function saveScribeTranscript(patientId, transcript) {
    setPatientData(prev => prev.map(p =>
      p.id === patientId ? { ...p, scribeTranscript: transcript } : p
    ))
  }

  function saveSoapNote(patientId, note) {
    const noteWithMeta = {
      ...note,
      id: `soap-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'draft',
    }
    setPatientData(prev => prev.map(p =>
      p.id === patientId
        ? { ...p, soapNotes: [...(p.soapNotes || []), noteWithMeta] }
        : p
    ))
    return noteWithMeta
  }

  function updateSoapNote(patientId, noteId, updates) {
    setPatientData(prev => prev.map(p =>
      p.id === patientId
        ? {
            ...p,
            soapNotes: (p.soapNotes || []).map(n =>
              n.id === noteId ? { ...n, ...updates } : n
            ),
          }
        : p
    ))
  }

  function submitSoapNote(patientId, noteId) {
    updateSoapNote(patientId, noteId, {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    })
  }

  function amendSoapNote(patientId, noteId) {
    updateSoapNote(patientId, noteId, { status: 'draft' })
  }

  function getPatientById(id) {
    return patientData.find(p => p.id === id) || null
  }

  return (
    <PatientDataContext.Provider value={{
      patientData,
      submitCheckIn,
      saveSessionPlan,
      saveScribeTranscript,
      saveSoapNote,
      updateSoapNote,
      submitSoapNote,
      amendSoapNote,
      getPatientById,
    }}>
      {children}
    </PatientDataContext.Provider>
  )
}

export function usePatientData() {
  const ctx = useContext(PatientDataContext)
  if (!ctx) throw new Error('usePatientData must be used within PatientDataProvider')
  return ctx
}
