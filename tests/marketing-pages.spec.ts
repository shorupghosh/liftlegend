import { test, expect } from '@playwright/test';

// =============================================================================
// TDD SPEC: Marketing Pages — LiftLegend
// 
// RED phase: These tests define the required behaviour of the 4 new marketing
// pages built today. Run them BEFORE any fixes to confirm they are RED.
// GREEN phase: The pages we built should make them pass.
// REFACTOR: See inline comments for structural improvements if tests fail.
// =============================================================================

// -----------------------------------------------------------------------------
// 1. COMPARE PAGE — /compare/mysoftheaven-alternative
// -----------------------------------------------------------------------------
test.describe('Compare Page — /compare/mysoftheaven-alternative', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compare/mysoftheaven-alternative');
  });

  test('has correct SEO title', async ({ page }) => {
    await expect(page).toHaveTitle(/LiftLegend vs MySoftHeaven/i);
  });

  test('renders the main H1 heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('LiftLegend vs MySoftHeaven');
  });

  test('shows the comparison table', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('highlights LiftLegend transparent pricing as a strength', async ({ page }) => {
    await expect(page.getByText('Upfront BDT pricing on website')).toBeVisible();
  });

  test('calls out MySoftHeaven hidden pricing as a weakness', async ({ page }) => {
    await expect(page.getByText('"Inbox for price"')).toBeVisible();
  });

  test('has a "Start 30-Day Trial" CTA that links to signup', async ({ page }) => {
    const ctaLinks = page.getByRole('link', { name: /start 30-day trial/i });
    await expect(ctaLinks.first()).toBeVisible();
    await expect(ctaLinks.first()).toHaveAttribute('href', /signup=true/);
  });

  test('navigates back to home via the logo link', async ({ page }) => {
    await page.getByRole('link').filter({ has: page.locator('img[alt*="LiftLegend"]') }).first().click();
    await expect(page).toHaveURL('/');
  });
});

// -----------------------------------------------------------------------------
// 2. FEATURE PAGE — /features/gym-billing-software-bangladesh
// -----------------------------------------------------------------------------
test.describe('Feature Page — Payment Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/features/gym-billing-software-bangladesh');
  });

  test('has correct SEO title for keyword "Gym Payment Tracking"', async ({ page }) => {
    await expect(page).toHaveTitle(/Gym Payment Tracking/i);
  });

  test('renders the H1 with Bangladesh keyword', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bangladesh');
  });

  test('shows bKash as a tracked payment method', async ({ page }) => {
    await expect(page.getByText(/bKash/i).first()).toBeVisible();
  });

  test('shows the live preview widget with BDT currency symbol', async ({ page }) => {
    await expect(page.getByText('৳ 18,500')).toBeVisible();
  });

  test('has a CTA link back to signup', async ({ page }) => {
    const cta = page.getByRole('link', { name: /start 30-day trial/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /signup=true/);
  });
});

// -----------------------------------------------------------------------------
// 3. FEATURE PAGE — /features/qr-code-gym-attendance-bangladesh
// -----------------------------------------------------------------------------
test.describe('Feature Page — QR Attendance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/features/qr-code-gym-attendance-bangladesh');
  });

  test('has correct SEO title for keyword "QR Code Gym Attendance Bangladesh"', async ({ page }) => {
    await expect(page).toHaveTitle(/QR Code Gym Attendance/i);
  });

  test('renders H1 with "Zero Hardware" messaging', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bangladesh');
  });

  test('promotes zero hardware concept', async ({ page }) => {
    await expect(page.getByText(/Zero Hardware/i).first()).toBeVisible();
  });

  test('attacks the hardware cost with specific BDT amount', async ({ page }) => {
    await expect(page.getByText(/15,000/)).toBeVisible();
  });

  test('has a CTA link back to signup', async ({ page }) => {
    const cta = page.getByRole('link', { name: /start 30-day trial/i });
    await expect(cta).toBeVisible();
  });
});

// -----------------------------------------------------------------------------
// 4. BLOG HUB — /blog
// -----------------------------------------------------------------------------
test.describe('Blog Hub — /blog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
  });

  test('has correct SEO title', async ({ page }) => {
    await expect(page).toHaveTitle(/Bangladesh Gym Owner/i);
  });

  test('renders the H1 heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText("Bangladesh Gym Owner's Guide");
  });

  test('shows exactly 3 blog post cards', async ({ page }) => {
    // Each card has "Read Article" — count them
    await expect(page.getByText('Read Article')).toHaveCount(3);
  });

  test('first card links to the open-gym-dhaka article', async ({ page }) => {
    const link = page.getByRole('link', { name: /2026 Guide to Opening a Gym/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/blog/open-gym-dhaka-2026');
  });

  test('second card links to the profit margins article', async ({ page }) => {
    const link = page.getByRole('link', { name: /Calculate Gym Profit Margins/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/blog/calculate-gym-profit-margins');
  });

  test('third card links to the unpaid members article', async ({ page }) => {
    const link = page.getByRole('link', { name: /Stop Members Using Your Gym/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/blog/stop-unpaid-gym-members');
  });
});

// -----------------------------------------------------------------------------
// 5. BLOG ARTICLE — /blog/open-gym-dhaka-2026
// -----------------------------------------------------------------------------
test.describe('Blog Article — How to Open a Gym in Dhaka', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog/open-gym-dhaka-2026');
  });

  test('has correct SEO title', async ({ page }) => {
    await expect(page).toHaveTitle(/Open.*Gym.*Dhaka/i);
  });

  test('renders H1 with Dhaka keyword', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dhaka');
  });

  test('has a Table of Contents with 6 items', async ({ page }) => {
    const tocLinks = page.getByRole('navigation').getByRole('link');
    // TOC is within the article — look for the ordered list items
    const tocItems = page.locator('ol a[href^="#"]');
    await expect(tocItems).toHaveCount(6);
  });

  test('has a BDT cost breakdown table', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('has a CTA section with trial link', async ({ page }) => {
    const cta = page.getByRole('link', { name: /start free trial/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /signup=true/);
  });

  test('"← All Articles" link navigates back to /blog', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /all articles/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/blog');
  });
});

// -----------------------------------------------------------------------------
// 6. BLOG ARTICLE — /blog/calculate-gym-profit-margins
// -----------------------------------------------------------------------------
test.describe('Blog Article — Gym Profit Margins', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog/calculate-gym-profit-margins');
  });

  test('has correct SEO title', async ({ page }) => {
    await expect(page).toHaveTitle(/Gym Profit Margins/i);
  });

  test('renders H1 mentioning Bangladesh', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bangladesh');
  });

  test('shows a BDT monthly costs table', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('displays the 3 profit levers section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Three Levers/i })).toBeVisible();
  });

  test('has a CTA link to free trial', async ({ page }) => {
    const cta = page.getByRole('link', { name: /start free/i });
    await expect(cta).toBeVisible();
  });
});

// -----------------------------------------------------------------------------
// 7. BLOG ARTICLE — /blog/stop-unpaid-gym-members
// -----------------------------------------------------------------------------
test.describe('Blog Article — Stop Unpaid Members', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog/stop-unpaid-gym-members');
  });

  test('has correct SEO title', async ({ page }) => {
    await expect(page).toHaveTitle(/Stop Members Using Your Gym Without Paying/i);
  });

  test('renders H1 with "Without Paying" messaging', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Without Paying');
  });

  test('shows the pain stat callout (৳ 9,000+)', async ({ page }) => {
    await expect(page.getByText('৳ 9,000+')).toBeVisible();
  });

  test('shows the SMS template section', async ({ page }) => {
    await expect(page.getByText(/Example SMS Templates/i)).toBeVisible();
  });

  test('shows the 3-step action plan summary', async ({ page }) => {
    await expect(page.getByText('Enable Automated SMS Reminders')).toBeVisible();
    await expect(page.getByText('Set Up QR Code Scanning at the Door')).toBeVisible();
    await expect(page.getByText('Review the Expired Dashboard Daily')).toBeVisible();
  });

  test('has a final CTA link to 30-day trial', async ({ page }) => {
    const cta = page.getByRole('link', { name: /30-Day Free Trial/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /signup=true/);
  });
});

// -----------------------------------------------------------------------------
// 8. LANDING PAGE SEO IMPROVEMENTS (from today's work)
// -----------------------------------------------------------------------------
test.describe('Landing Page — SEO Improvements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('H1 is now pain-focused, not corporate', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText('Losing Money');
    // Must NOT contain the old corporate headline
    await expect(h1).not.toContainText('Elevate Your');
  });

  test('FAQPage schema is injected in <head>', async ({ page }) => {
    const scriptLocator = page.locator('#faq-schema');
    await expect(scriptLocator).toBeAttached();
    const faqSchema = await scriptLocator.textContent();
    expect(faqSchema).not.toBeNull();
    const parsed = JSON.parse(faqSchema!);
    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity.length).toBeGreaterThanOrEqual(6);
  });

  test('FAQ accordion section is visible on the page', async ({ page }) => {
    await expect(page.getByText('Frequently Asked Questions')).toBeVisible();
  });

  test('FAQ items include bKash payment question', async ({ page }) => {
    await expect(page.getByText(/Does LiftLegend support bKash/i)).toBeVisible();
  });

  test('FAQ items include hardware question', async ({ page }) => {
    await expect(page.getByText(/Do I need.*hardware.*fingerprint/i)).toBeVisible();
  });

  test('BrandLogo images have SEO-enriched alt text', async ({ page }) => {
    const logoImages = page.locator('img[alt*="Gym Management Software Bangladesh"]');
    await expect(logoImages.first()).toBeVisible();
  });

  test('footer Product section includes internal SEO links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'vs MySoftHeaven' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Payment Tracking' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'QR Attendance' })).toBeVisible();
  });
});
