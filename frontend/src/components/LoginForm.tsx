import React, { useState } from 'react'

type Props = {
  onLogin: (username: string) => void
}

export default function LoginForm({ onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) {
      setError('⚠️ Please enter a username')
      return
    }
    setError('')
    onLogin(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <button type="submit" disabled={!username.trim()}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* Future: Add Google login button here */}
    </form>
  )
}
