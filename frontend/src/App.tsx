import React, { useEffect, useState } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>("Loading...")

  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
fetch(`${BACKEND_URL}/health`)
      .then(res => res.json())
      .then(data => setBackendStatus(data.message))
      .catch(() => setBackendStatus("Backend not reachable"))
  }, [])

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", marginTop: "50px" }}>
      <h1>📧 KMail</h1>
      <p>Backend status: {backendStatus}</p>
    </div>
  )
}

export default App
