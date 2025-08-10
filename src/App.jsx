import React from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

export default function App() {
  const [user, setUser] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  return user ? <Dashboard user={user} /> : <Auth />
}
