import type { Message, User } from '../types'

export const MAX_MESSAGE_LENGTH = 2000
export const MAX_MESSAGES = 50

export class ApiError extends Error {
    readonly status: number

    constructor(status: number) {
        super(`Request failed with status ${status}`)
        this.status = status
    }
}

type Options = { method?: 'GET' | 'POST'; body?: unknown }

// status 0 means the request never reached the server
const request = async <T>(
    path: string,
    { method = 'GET', body }: Options = {},
): Promise<T> => {
    let res: Response
    try {
        res = await fetch(path, {
            method,
            credentials: 'include',
            headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
        })
    } catch {
        throw new ApiError(0)
    }
    if (!res.ok) throw new ApiError(res.status)
    const text = await res.text()
    return (text ? JSON.parse(text) : undefined) as T
}

// Any HTTP error means signed out. Only a network failure throws.
export const getMe = async (): Promise<User | null> => {
    try {
        const data = await request<{ user?: User | null }>('/auth/me')
        return data?.user ?? null
    } catch (error) {
        if (error instanceof ApiError && error.status !== 0) return null
        throw error
    }
}

export const signInWithGoogle = async (credential: string): Promise<User> => {
    const data = await request<{ user: User }>('/auth/google', {
        method: 'POST',
        body: { credential },
    })
    return data.user
}

export const signOut = (): Promise<void> =>
    request<void>('/auth/logout', { method: 'POST' })

export const sendChat = async (messages: Message[]): Promise<string> => {
    const data = await request<{ reply: string }>('/chat', {
        method: 'POST',
        body: { messages },
    })
    return data.reply
}