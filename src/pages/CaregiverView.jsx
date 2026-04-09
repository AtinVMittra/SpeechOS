import { useParams, Navigate } from 'react-router-dom'

export default function CaregiverView() {
  const { patientId } = useParams()
  return <Navigate to={`/patient/${patientId}`} replace />
}
