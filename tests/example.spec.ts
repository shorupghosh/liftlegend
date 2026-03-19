import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/LiftLegend/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');

  // Click the get started link (which we updated to "Start 30-Day Free Trial" in the popular plan)
  // Or check for the "Simple, transparent pricing" text
  await expect(page.getByText('Simple, transparent pricing')).toBeVisible();
});
