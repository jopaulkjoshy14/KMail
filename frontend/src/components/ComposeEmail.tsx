import React, { useState } from 'react'

export default function ComposeEmail() {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

  const handleSend = async () => {
    if (!to || !subject || !body) {
      alert('Please fill in all fields')
      return
    }

    try {
      const res = await fetch(`${BACKEND_URL}/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      })

      if (!res.ok) throw new Error('Failed to send email')

      setStatus('Email sent successfully!')
      setTo('')
      setSubject('')
      setBody('')
    } catch (err) {
      setStatus('Error sending email')
    }
  }

  return (
    <div>
      <h2>Compose Email</h2>
      <input
        type="text"
        placeholder="To"
        value={to}
        onChange={e => setTo(e.target.value)}
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={e => setSubject(e.target.value)}
      />
      <textarea
        placeholder="Body"
        value={body}
        onChange={e => setBody(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
      {status && <p>{status}</p>}
    </div>
  )
}
