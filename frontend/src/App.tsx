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
      .catch(err => {
        console.error("Health check failed:", err)
        setBackendStatus('Backend not reachable')
      })
  }, [])

  const handleLogin = (username: string) => {
    setUser(username)
    setPage('inbox')
  }

  const handleClearData = async () => {
    setClearMessage('Processing...')
    try {
      const res = await fetch(`${BACKEND_URL}/dev/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Could not parse error response' }))
        console.error('Clear data failed:', errorData)
        setClearMessage(`❌ Failed: ${errorData.error || 'Unknown error'}`)
        return
      }

      const data = await res.json()
      console.log('Clear data response:', data)
      setClearMessage('✅ All data cleared successfully!')
    } catch (err) {
      console.error('Fetch error:', err)
      setClearMessage(`❌ Backend not reachable: ${err}`)
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
      <h1>📧 KMail</h1>
      <p>Backend status: {backendStatus}</p>

      {/* Temporary admin control */}
      <div style={{
        margin: '15px 0',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9'
      }}>
        <button onClick={handleClearData} style={{ padding: '8px 12px', cursor: 'pointer' }}>
          Clear All Data
        </button>
        {clearMessage && <p style={{ marginTop: '10px' }}>{clearMessage}</p>}
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
