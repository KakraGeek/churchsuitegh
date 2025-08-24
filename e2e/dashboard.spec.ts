import { test, expect } from '@playwright/test'

test.describe('Dashboard E2E', () => {
  test('user can access dashboard after authentication', async ({ page }) => {
    await page.goto('/')
    
    // Should redirect to sign-in or show dashboard if already signed in
    // This will need real Clerk setup for full e2e testing
    await expect(page).toHaveTitle(/ChurchSuite/)
  })

  test('dashboard is mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/')
    
    // Mobile menu button should be visible
    await expect(page.locator('button').first()).toBeVisible()
  })
})
