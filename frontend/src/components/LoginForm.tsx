import React, { useState } from 'react'

type Props = {
  onLogin: (username: string) => void
}

export default function LoginForm({ onLogin }: Props) {
  const [username, setUsername] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) return alert('Enter a username')
    onLogin(username)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  )
}
