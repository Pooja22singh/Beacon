import { useEffect, useRef, useState } from 'react'
import { signInWithGoogle } from '../lib/api'
import type { User } from '../types'
import { BeaconDot } from './BeaconDot'
import { MaintainerCredit } from './MaintainerCredit'

const GSI_SRC = 'https://accounts.google.com/gsi/client'
const GOOGLE_CLIENT_ID: string | undefined = import.meta.env.VITE_GOOGLE_CLIENT_ID

type Props = { onSignedIn: (user: User) => void }

export const SignIn = ({ onSignedIn }: Props) => {
    const buttonRef = useRef<HTMLDivElement>(null)
    const [failed, setFailed] = useState(false)
    const notConfigured = !GOOGLE_CLIENT_ID

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return undefined

        const render = () => {
            const target = buttonRef.current
            if (!window.google || !target) return
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async ({ credential }: { credential: string }) => {
                    setFailed(false)
                    try {
                        onSignedIn(await signInWithGoogle(credential))
                    } catch {
                        setFailed(true)
                    }
                },
            })
            target.replaceChildren()
            window.google.accounts.id.renderButton(target, {
                theme: 'outline',
                size: 'large',
                width: 280,
            })
        }

        if (window.google) {
            render()
            return undefined
        }

        const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
        const script = existing ?? document.createElement('script')
        if (!existing) {
            script.src = GSI_SRC
            script.async = true
            document.head.appendChild(script)
        }
        script.addEventListener('load', render)
        return () => script.removeEventListener('load', render)
    }, [onSignedIn])

    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-4">
            <section className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-8 text-center text-card-foreground shadow-sm">
                <div className="flex items-center gap-2.5">
                    <BeaconDot />
                    <span className="text-lg font-semibold tracking-tight">Beacon</span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-balance">
                    Chat with support
                </h1>
                <p className="text-sm text-muted-foreground">
                    Sign in with Google to start a conversation.
                </p>
                <div ref={buttonRef} className="mt-2 min-h-11" />
                {(failed || notConfigured) && (
                    <p role="alert" className="text-sm text-destructive">
                        {notConfigured
                            ? 'Sign-in is not configured.'
                            : "Sign-in didn't complete. Please try again."}
                    </p>
                )}
            </section>
            <MaintainerCredit />
        </main>
    )
}
