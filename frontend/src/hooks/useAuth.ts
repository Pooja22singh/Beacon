import { useCallback, useEffect, useState } from 'react'
import { getMe, signOut as signOutRequest } from '../lib/api'
import type { User } from '../types'

type AuthStatus = 'loading' | 'signedOut' | 'signedIn' | 'error'

type AuthResult = { status: AuthStatus; user: User | null }

// Pure fetch, no state. Callers decide when to apply the result.
const loadAuth = async (): Promise<AuthResult> => {
    try {
        const me = await getMe()
        return { status: me ? 'signedIn' : 'signedOut', user: me }
    } catch {
        return { status: 'error', user: null }
    }
}

export const useAuth = () => {
    const [status, setStatus] = useState<AuthStatus>('loading')
    const [user, setUser] = useState<User | null>(null)

    const apply = useCallback((result: AuthResult) => {
        setUser(result.user)
        setStatus(result.status)
    }, [])

    useEffect(() => {
        // Ignore a late response if the component unmounted (StrictMode runs effects twice)
        let active = true
        void loadAuth().then((result) => {
            if (active) apply(result)
        })
        return () => {
            active = false
        }
    }, [apply])

    const retry = useCallback(() => {
        setStatus('loading')
        void loadAuth().then(apply)
    }, [apply])

    const signIn = useCallback((nextUser: User) => {
        setUser(nextUser)
        setStatus('signedIn')
    }, [])

    const markSignedOut = useCallback(() => {
        setUser(null)
        setStatus('signedOut')
    }, [])

    const signOut = useCallback(async () => {
        try {
            await signOutRequest()
        } finally {
            window.google?.accounts.id.disableAutoSelect()
            markSignedOut()
        }
    }, [markSignedOut])

    return { status, user, signIn, signOut, markSignedOut, retry }
}
