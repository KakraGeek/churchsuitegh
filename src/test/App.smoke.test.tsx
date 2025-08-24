import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/App'

/**
 * Unified Smoke Test: App
 * 
 * Tests the core application functionality that must work
 * for the entire system to be operational.
 */
describe('App Smoke Test', () => {
  it('renders without crashing', () => {
    render(<App />)
    
    // Should render the main layout
    expect(screen.getAllByText('ChurchSuite Ghana')).toHaveLength(2) // Mobile and desktop headers
  })

  it('displays church branding', () => {
    render(<App />)
    
    expect(screen.getAllByText('ChurchSuite Ghana')).toHaveLength(2) // Mobile and desktop headers
  })

  it('shows navigation elements', () => {
    render(<App />)
    
    // Check for main navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Members')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
    expect(screen.getByText('Giving')).toBeInTheDocument()
  })

  it('displays user authentication component', () => {
    render(<App />)
    
    // Check that the user's name is displayed (from our mock)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })
})
