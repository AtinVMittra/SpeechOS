import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { PatientDataProvider } from './context/PatientDataContext.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CaregiverView from './pages/CaregiverView.jsx'
import PatientHome from './pages/PatientHome.jsx'
import SessionPlayer from './pages/SessionPlayer.jsx'
import CheckIn from './pages/CheckIn.jsx'

function CaregiverRedirect() {
  const { patientId } = useParams()
  return <Navigate to={`/patient/${patientId}`} replace />
}

export default function App() {
  return (
    <PatientDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/caregiver/:patientId" element={<CaregiverRedirect />} />
          <Route path="/patient/:patientId" element={<PatientHome />} />
          <Route path="/patient/:patientId/session" element={<SessionPlayer />} />
          <Route path="/patient/:patientId/checkin" element={<CheckIn />} />
        </Routes>
      </BrowserRouter>
    </PatientDataProvider>
  )
}
