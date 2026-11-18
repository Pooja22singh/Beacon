import { useEffect, useRef, useState } from 'react'

type Message = { role: 'user' | 'assistant'; text: string }
type User = { id: string; email: string; name: string }

declare global {
  interface Window {
    google?: any
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  // On page load, ask the backend who is signed in
  useEffect(() => {
    fetch('/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .finally(() => setChecking(false))
  }, [])

  // When signed out, show the Google button
  useEffect(() => {
    if (checking || user) return

    function render() {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          const res = await fetch('/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential }),
          })
          if (res.ok) setUser((await res.json()).user)
        },
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
      })
    }

    if (window.google) {
      render()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = render
    document.head.appendChild(script)
  }, [checking, user])

  async function logout() {
    await fetch('/auth/logout', { method: 'POST' })
    setUser(null)
    setMessages([])
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      if (res.status === 401) {
        setUser(null)
        return
      }
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (checking) return null

  if (!user) {
    return (
      <main>
        <h1>Beacon</h1>
        <p>Sign in to chat with support.</p>
        <div ref={buttonRef} />
      </main>
    )
  }

  return (
    <main>
      <h1>Beacon</h1>
      <p>
        Signed in as {user.name || user.email} <button onClick={logout}>Sign out</button>
      </p>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>
            <b>{m.role}:</b> {m.text}
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your order"
        />
        <button disabled={loading}>Send</button>
      </form>
    </main>
  )
}

export default App