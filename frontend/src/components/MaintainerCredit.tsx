const PORTFOLIO_URL = 'https://pooja22singh.github.io/PoojaSingh/'

type Props = { className?: string }

export const MaintainerCredit = ({ className = '' }: Props) => (
    <p className={`text-xs text-muted-foreground ${className}`}>
        Maintained by Pooja Singh ·{' '}
        <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2 hover:text-foreground"
        >
            Portfolio
        </a>
    </p>
)
