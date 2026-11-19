type Props = { active?: boolean; className?: string }

export const BeaconDot = ({ active = false, className = '' }: Props) => (
    <span className={`relative inline-flex size-2.5 ${className}`} aria-hidden="true">
        {active && (
            <span className="absolute inset-0 animate-ping rounded-full bg-beacon/60 motion-reduce:animate-none" />
        )}
        <span className="relative size-2.5 rounded-full bg-beacon" />
    </span>
)
