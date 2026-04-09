import { useEffect, useState } from 'react'

export default function XpPopup({ xpAmount, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      onDone?.()
    }, 1500)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-teal-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg"
      style={{ animation: 'xpFloat 1.5s ease-out forwards' }}
    >
      <span>⚡</span>
      <span>+{xpAmount} XP</span>
    </div>
  )
}
