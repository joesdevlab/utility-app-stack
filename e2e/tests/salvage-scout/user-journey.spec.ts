import { test, expect } from "@playwright/test";

test.describe("Salvage Scout - User Journeys", () => {
  test("should load the app with branding", async ({ page }) => {
    await page.goto("/");

    // Check for app branding
    await expect(page.getByText(/salvage scout/i)).toBeVisible();
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

    await expect(page).toHaveTitle(/salvage/i);
  });
});

test.describe("Salvage Scout - My Listings Page", () => {
  test("should navigate to my listings page", async ({ page }) => {
    await page.goto("/my-listings");

    await expect(page.locator("body")).not.toBeEmpty();
  });
});

test.describe("Salvage Scout - Saved Listings Page", () => {
  test("should navigate to saved page", async ({ page }) => {
    await page.goto("/saved");

    await expect(page.locator("body")).not.toBeEmpty();
  });
});

test.describe("Salvage Scout - Profile Page", () => {
  test("should navigate to profile page", async ({ page }) => {
    await page.goto("/profile");

    await expect(page.locator("body")).not.toBeEmpty();
  });
});
