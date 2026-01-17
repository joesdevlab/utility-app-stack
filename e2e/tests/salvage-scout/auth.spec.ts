import { test, expect } from "@playwright/test";

test.describe("Salvage Scout - Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show login form when not authenticated", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("should have link to create account", async ({ page }) => {
    const signUpLink = page.getByText(/create account/i);
    await expect(signUpLink).toBeVisible();
  });

  test("should show validation error for empty email", async ({ page }) => {
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByLabel(/email/i)).toBeFocused();
  });

  test("should have password reset link", async ({ page }) => {
    const resetLink = page.getByText(/forgot password/i);
    await expect(resetLink).toBeVisible();
  });

  test("should toggle between sign in and sign up forms", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();

    await page.getByText(/create account/i).click();
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible();

    await page.getByText(/sign in/i).first().click();
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });
});
