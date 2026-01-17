import { test, expect } from "@playwright/test";

test.describe("Bio-Swap - User Journeys", () => {
  test("should load the app with branding", async ({ page }) => {
    await page.goto("/");

    // Check for app branding
    await expect(page.getByText(/bio-swap/i)).toBeVisible();
  });

  test("should have accessible navigation", async ({ page }) => {
    await page.goto("/");

    const skipLink = page.locator("a[href='#main-content']");
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const body = await page.locator("body").boundingBox();
    expect(body?.width).toBeLessThanOrEqual(375);
  });

  test("should have proper page title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/bio-swap/i);
  });
});

test.describe("Bio-Swap - Scan History Page", () => {
  test("should navigate to history page", async ({ page }) => {
    await page.goto("/history");

    // Should show history-related content or redirect to login
    await expect(page.locator("body")).not.toBeEmpty();
  });
});

test.describe("Bio-Swap - Favorites Page", () => {
  test("should navigate to favorites page", async ({ page }) => {
    await page.goto("/favorites");

    await expect(page.locator("body")).not.toBeEmpty();
  });
});
