export type Role = 'user' | 'assistant'

export type Message = { role: Role; text: string }

export type ChatMessage = Message & { id: string }

export type User = { id: string; email: string; name: string }
