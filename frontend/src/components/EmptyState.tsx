import { Button } from './Button'

const SUGGESTIONS = [
    'Where is my order?',
    'What is your return policy?',
    'How long does shipping take?',
]

type Props = { onPick: (text: string) => void; disabled: boolean }

export const EmptyState = ({ onPick, disabled }: Props) => (
    <section className="my-auto py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
            How can we help?
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
            Ask about an order, a return, or delivery.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
            {SUGGESTIONS.map((text) => (
                <li key={text}>
                    <Button
                        variant="outline"
                        size="pill"
                        disabled={disabled}
                        onClick={() => onPick(text)}
                    >
                        {text}
                    </Button>
                </li>
            ))}
        </ul>
    </section>
)