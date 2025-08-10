import React from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export default function Auth() {
  const [mode, setMode] = React.useState('login') // 'login' | 'signup'
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">{mode === 'signup' ? 'Create an account' : 'Log in'}</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border rounded" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div className="flex items-center justify-between">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">{mode==='signup'?'Sign up':'Log in'}</button>
          <button className="text-sm" type="button" onClick={()=>setMode(mode==='signup'?'login':'signup')}>
            {mode==='signup'?'Have an account? Log in':'No account? Sign up'}
          </button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
    </div>
  )
}
