import React, { useState } from 'react'

type Props = {
  onLogin: (username: string) => void
}

export default function LoginForm({ onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [message, setMessage] = useState('')

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setMessage('⚠️ Fill both fields')
      return
    }

    try {
      const res = await fetch(`${BACKEND_URL}/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()

      if (res.ok) {
        onLogin(data.username)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch {
      setMessage('❌ Backend not reachable')
    }
  }

  return (
    <div>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : 'Create new account'}
      </button>
      {message && <p>{message}</p>}
    </div>
  )
                                           }
