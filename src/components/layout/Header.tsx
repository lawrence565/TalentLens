import React from 'react'
import type { User } from '../../types'
import Button from '../ui/Button'

interface HeaderProps {
  user: User | null
  onLogout?: () => void | Promise<void>
}

const TLLogoMark: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect width="40" height="40" rx={size * 0.24} className="fill-brand-500" />
    <circle cx="17" cy="18" r="8.5" stroke="white" strokeWidth="2.5" fill="none" />
    <circle cx="17" cy="18" r="2.8" fill="white" />
    <line x1="23" y1="24" x2="30" y2="31" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
)

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => (
  <header className="border-b border-n-200 bg-white">
    <div className="mx-auto flex max-w-[1152px] items-center justify-between px-6 py-3.5">
      <div className="flex items-center gap-3">
        <TLLogoMark size={36} />
        <span className="font-sans text-base font-extrabold text-n-900">TalentLens</span>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden font-sans text-sm text-n-600 sm:inline">{user.name}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Log out
            </Button>
          </>
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-n-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-n-500" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
        )}
      </div>
    </div>
  </header>
)

export default Header
