import { ArrowUp } from 'lucide-react'
import { useId, type KeyboardEvent } from 'react'
import { MAX_MESSAGE_LENGTH } from '../lib/api'
import { Button } from './Button'

type Props = {
    value: string
    onChange: (value: string) => void
    onSubmit: () => void
    disabled: boolean
}

export const Composer = ({ value, onChange, onSubmit, disabled }: Props) => {
    const id = useId()
    const canSend = value.trim().length > 0 && !disabled
    const nearLimit = value.length >= MAX_MESSAGE_LENGTH - 200

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            if (canSend) onSubmit()
        }
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                if (canSend) onSubmit()
            }}
        >
            <label htmlFor={id} className="sr-only">
                Message
            </label>
            <div className="flex items-end gap-2 rounded-3xl border border-input bg-card p-2 pl-4 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
                <textarea
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={MAX_MESSAGE_LENGTH}
                    rows={1}
                    placeholder="Ask about your order"
                    className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-[0.9375rem] outline-none placeholder:text-muted-foreground"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="shrink-0"
                    disabled={!canSend}
                    aria-label="Send message"
                >
                    <ArrowUp />
                </Button>
            </div>
            {nearLimit && (
                <p className="mt-1.5 px-4 text-xs text-muted-foreground" aria-live="polite">
                    {value.length} / {MAX_MESSAGE_LENGTH}
                </p>
            )}
        </form>
    )
}