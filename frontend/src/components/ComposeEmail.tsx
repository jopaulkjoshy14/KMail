import React, { useState } from 'react'

export default function ComposeEmail() {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const handleSend = () => {
    alert(`Email sent to ${to} with subject "${subject}"`)
    setTo('')
    setSubject('')
    setBody('')
  }

  return (
    <div>
      <h2>Compose Email</h2>
      <input type="text" placeholder="To" value={to} onChange={e => setTo(e.target.value)} />
      <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
      <textarea placeholder="Body" value={body} onChange={e => setBody(e.target.value)} />
      <button onClick={handleSend}>Send</button>
    </div>
  )
}
