import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline'
type Size = 'md' | 'sm' | 'pill' | 'icon'

const base =
    'inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4'

const variants: Record<Variant, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-border bg-card hover:bg-muted',
}

// Radius lives in the size so callers never need to override it
const sizes: Record<Size, string> = {
    md: 'h-10 rounded-xl px-4',
    sm: 'h-8 rounded-lg px-3',
    pill: 'h-9 rounded-full px-4',
    icon: 'size-11 rounded-full',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }

export const Button = ({
    variant = 'primary',
    size = 'md',
    type = 'button',
    className = '',
    ...props
}: Props) => (
    <button
        type={type}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
    />
)
