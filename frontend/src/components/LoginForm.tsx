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
      setMessage('⚠️ Please fill all fields')
      return
    }

    const endpoint = isRegister ? 'register' : 'login'

    try {
      const res = await fetch(`${BACKEND_URL}/users/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(data.message || 'Success')
        onLogin(username)
      } else {
        setMessage(data.error || 'Failed')
      }
    } catch {
      setMessage('❌ Backend not reachable')
    }
  }

  return (
    <div>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ flex: 1 }}
          />
          <span style={{ marginLeft: '5px', fontWeight: 'bold', color: '#555' }}>
            @kmail.com
          </span>
        </div>
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
      <button onClick={() => { setIsRegister(!isRegister); setMessage('') }}>
        {isRegister ? 'Already have an account? Login' : 'New user? Register'}
      </button>
      {message && <p>{message}</p>}
    </div>
  )
}    
