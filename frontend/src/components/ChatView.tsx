import { useEffect, useRef, useState } from 'react'
import { ApiError, MAX_MESSAGE_LENGTH, MAX_MESSAGES, sendChat } from '../lib/api'
import { chatErrorMessage } from '../lib/errors'
import type { ChatMessage, User } from '../types'
import { BeaconDot } from './BeaconDot'
import { Button } from './Button'
import { Composer } from './Composer'
import { EmptyState } from './EmptyState'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { UserMenu } from './UserMenu'

type Props = {
    user: User
    onSignOut: () => Promise<void> | void
    onUnauthorized: () => void
}

const newId = () => crypto.randomUUID()

export const ChatView = ({ user, onSignOut, onUnauthorized }: Props) => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        endRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' })
    }, [messages, sending, error])

    const requestReply = async (history: ChatMessage[]) => {
        setSending(true)
        setError(null)
        try {
            // The server accepts 1 to 50 messages of 1 to 2000 characters each
            const payload = history
                .slice(-MAX_MESSAGES)
                .map(({ role, text }) => ({ role, text: text.slice(0, MAX_MESSAGE_LENGTH) }))
            const reply = await sendChat(payload)
            if (!reply.trim()) throw new ApiError(500)
            setMessages((prev) => [...prev, { id: newId(), role: 'assistant', text: reply }])
        } catch (e) {
            if (e instanceof ApiError && e.status === 401) {
                onUnauthorized()
                return
            }
            setError(chatErrorMessage(e instanceof ApiError ? e.status : 0))
        } finally {
            setSending(false)
        }
    }

    const submit = (text: string) => {
        const trimmed = text.trim()
        if (!trimmed || sending) return
        const history: ChatMessage[] = [
            ...messages,
            { id: newId(), role: 'user', text: trimmed },
        ]
        setMessages(history)
        setInput('')
        void requestReply(history)
    }

    return (
        <div className="flex h-dvh flex-col bg-background text-foreground">
            <header className="border-b bg-card">
                <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
                    <div className="flex items-center gap-2.5">
                        <BeaconDot active={sending} />
                        <span className="text-base font-semibold tracking-tight">Beacon</span>
                    </div>
                    <UserMenu user={user} onSignOut={onSignOut} />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 py-6">
                    {messages.length === 0 && <EmptyState onPick={submit} disabled={sending} />}
                    <div
                        role="log"
                        aria-live="polite"
                        aria-label="Conversation"
                        className="flex flex-col gap-4"
                    >
                        {messages.map((m) => (
                            <MessageBubble key={m.id} message={m} />
                        ))}
                        {sending && <TypingIndicator />}
                    </div>
                    <div ref={endRef} />
                </div>
            </main>

            <footer className="border-t bg-card pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
                <div className="mx-auto w-full max-w-2xl space-y-3 px-4">
                    {error && (
                        <div
                            role="alert"
                            className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                        >
                            <p>{error}</p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void requestReply(messages)}
                            >
                                Retry
                            </Button>
                        </div>
                    )}
                    <Composer
                        value={input}
                        onChange={setInput}
                        onSubmit={() => submit(input)}
                        disabled={sending}
                    />
                </div>
            </footer>
        </div>
    )
}
