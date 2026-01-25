import { test, expect } from '@playwright/test';

test.describe('Vora Shopping Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete shopping journey', async ({ page }) => {
    // Wait for products to load
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    
    // Check if products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
    
    // Add product to cart
    await productCards.first().locator('button:has-text("Add to Cart")').click();
    
    // Verify cart badge updates
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('1');
    
    // Open cart sidebar
    await page.locator('[data-testid="cart-button"]').click();
    await expect(page.locator('[data-testid="cart-sidebar"]')).toBeVisible();
    
    // Verify product in cart
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    
    // Proceed to checkout
    await page.locator('button:has-text("Checkout")').click();
    await expect(page.locator('[data-testid="checkout-modal"]')).toBeVisible();
    
    // Verify emotion discount is displayed if applicable
    const discountElement = page.locator('[data-testid="emotion-discount"]');
    if (await discountElement.isVisible()) {
      await expect(discountElement).toContainText('%');
    }
  });

  test('voice controller interaction', async ({ page }) => {
    // Check voice controller is present
    await expect(page.locator('[data-testid="voice-controller"]')).toBeVisible();
    
    // Test voice hints
    await expect(page.locator('[data-testid="voice-hints"]')).toBeVisible();
    
    // Verify emotion meter
    await expect(page.locator('[data-testid="emotion-meter"]')).toBeVisible();
  });

  test('filter functionality', async ({ page }) => {
    // Open filter sidebar
    await page.locator('[data-testid="filter-button"]').click();
    await expect(page.locator('[data-testid="filter-sidebar"]')).toBeVisible();
    
    // Apply category filter
    await page.locator('input[value="dresses"]').check();
    
    // Verify filtered results
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Clear filters
    await page.locator('button:has-text("Clear All")').click();
  });

  test('analytics dashboard', async ({ page }) => {
    // Navigate to analytics (if accessible)
    const analyticsButton = page.locator('[data-testid="analytics-button"]');
    if (await analyticsButton.isVisible()) {
      await analyticsButton.click();
      await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="emotion-chart"]')).toBeVisible();
    }
  });
});