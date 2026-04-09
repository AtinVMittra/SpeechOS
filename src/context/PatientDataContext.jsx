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

  function getPatientById(id) {
    return patientData.find(p => p.id === id) || null
  }

  return (
    <PatientDataContext.Provider value={{ patientData, submitCheckIn, getPatientById }}>
      {children}
    </PatientDataContext.Provider>
  )
}

export function usePatientData() {
  const ctx = useContext(PatientDataContext)
  if (!ctx) throw new Error('usePatientData must be used within PatientDataProvider')
  return ctx
}
