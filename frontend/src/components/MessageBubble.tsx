import type { ChatMessage } from '../types'

type Props = { message: ChatMessage }

export const MessageBubble = ({ message }: Props) => {
    const isUser = message.role === 'user'
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-3xl px-4 py-2.5 text-[0.9375rem] leading-relaxed sm:max-w-[34rem] ${
                    isUser
                        ? 'rounded-br-lg bg-primary text-primary-foreground'
                        : 'rounded-bl-lg border bg-card text-card-foreground'
                }`}
            >
                <span className="sr-only">{isUser ? 'You: ' : 'Beacon: '}</span>
                {message.text}
            </div>
        </div>
    )
}
