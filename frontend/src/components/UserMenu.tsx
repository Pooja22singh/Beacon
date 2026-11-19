import { LogOut } from 'lucide-react'
import { Button } from './Button'
import type { User } from '../types'

type Props = { user: User; onSignOut: () => Promise<void> | void }

export const UserMenu = ({ user, onSignOut }: Props) => (
    <div className="flex items-center gap-3">
        <span
            className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            title={user.email}
            aria-hidden="true"
        >
            {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden text-sm sm:inline">{user.name}</span>
        <Button variant="outline" size="sm" onClick={() => void onSignOut()}>
            <LogOut />
            Sign out
        </Button>
    </div>
)
