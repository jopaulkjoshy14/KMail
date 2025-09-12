import React, { useEffect, useState } from 'react'

type Email = {
  id: string
  from: string
  subject: string
  body: string
  date: string
}

export default function Inbox() {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    fetch(`${BACKEND_URL}/emails/inbox`)
      .then(res => res.json())
      .then(data => {
        setEmails(data.emails || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to fetch inbox emails')
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading inbox...</p>
  if (error) return <p>{error}</p>
  if (emails.length === 0) return <p>No emails in your inbox.</p>

  return (
    <div>
      <h2>Inbox</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {emails.map(email => (
          <li key={email.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px', paddingBottom: '10px' }}>
            <strong>From:</strong> {email.from} <br />
            <strong>Subject:</strong> {email.subject} <br />
            <p>{email.body}</p>
            <small>{new Date(email.date).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  )
         }
