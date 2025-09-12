import React, { useEffect, useState } from 'react'
import LoginForm from './components/LoginForm'
import ComposeEmail from './components/ComposeEmail'
import Inbox from './components/Inbox'
import Sent from './components/Sent'

type Page = 'login' | 'inbox' | 'sent' | 'compose'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Loading...')
  const [page, setPage] = useState<Page>('login')
  const [user, setUser] = useState<string | null>(null)
  const [clearMessage, setClearMessage] = useState<string>('')

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    fetch(`${BACKEND_URL}/health`)
      .then(res => res.json())
      .then(data => setBackendStatus(data.message))
      .catch(() => setBackendStatus('Backend not reachable'))
  }, [])

  const handleLogin = (username: string) => {
    setUser(username)
    setPage('inbox')
  }

  const handleClearData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/clear-data`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) setClearMessage('✅ All data cleared successfully!')
      else setClearMessage(`❌ Failed: ${data.error || 'Unknown error'}`)
    } catch {
      setClearMessage('❌ Backend not reachable')
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
      <h1>📧 KMail</h1>
      <p>Backend status: {backendStatus}</p>

      {/* Temporary admin controls */}
      <div style={{ margin: '10px 0' }}>
        <button onClick={handleClearData}>Clear All Data</button>
        {clearMessage && <p>{clearMessage}</p>}
      </div>

      <div style={{ marginTop: '20px' }}>
        {user && (
          <nav style={{ marginBottom: '20px' }}>
            <button onClick={() => setPage('inbox')}>Inbox</button>
            <button onClick={() => setPage('sent')}>Sent</button>
            <button onClick={() => setPage('compose')}>Compose</button>
            <button onClick={() => { setUser(null); setPage('login') }}>Logout</button>
          </nav>
        )}

        {!user && page === 'login' && <LoginForm onLogin={handleLogin} />}
        {user && page === 'inbox' && <Inbox username={user} />}
        {user && page === 'sent' && <Sent username={user} />}
        {user && page === 'compose' && <ComposeEmail username={user} />}
      </div>
    </div>
  )
}

export default App
