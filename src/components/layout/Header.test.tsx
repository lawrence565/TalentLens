import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Header from './Header'
import type { User } from '../../types'

const user: User = {
  id: 'u1',
  email: 'alex@example.com',
  name: 'Alex Chen',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('Header', () => {
  it('renders TalentLens wordmark', () => {
    render(<Header user={null} />)
    expect(screen.getByText('TalentLens')).toBeInTheDocument()
  })

  it('renders lens SVG logo mark', () => {
    render(<Header user={null} />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('shows user name when logged in', () => {
    render(<Header user={user} />)
    expect(screen.getByText('Alex Chen')).toBeInTheDocument()
  })

  it('shows Log out button when logged in', () => {
    render(<Header user={user} />)
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })

  it('calls onLogout when log out is clicked', async () => {
    const userEvent_ = userEvent.setup()
    const onLogout = vi.fn()
    render(<Header user={user} onLogout={onLogout} />)
    await userEvent_.click(screen.getByRole('button', { name: /log out/i }))
    expect(onLogout).toHaveBeenCalledOnce()
  })

  it('does not show Log out when logged out', () => {
    render(<Header user={null} />)
    expect(screen.queryByRole('button', { name: /log out/i })).not.toBeInTheDocument()
  })
})
