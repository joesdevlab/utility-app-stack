import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    // Apprentice Log
    {
      name: "apprentice-log",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3001",
      },
      testMatch: "**/apprentice-log/**/*.spec.ts",
    },
    {
      name: "apprentice-log-mobile",
      use: {
        ...devices["iPhone 14"],
        baseURL: "http://localhost:3001",
      },
      testMatch: "**/apprentice-log/**/*.spec.ts",
    },
    // Bio-Swap
    {
      name: "bio-swap",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3002",
      },
      testMatch: "**/bio-swap/**/*.spec.ts",
    },
    {
      name: "bio-swap-mobile",
      use: {
        ...devices["iPhone 14"],
        baseURL: "http://localhost:3002",
      },
      testMatch: "**/bio-swap/**/*.spec.ts",
    },
    // Salvage Scout
    {
      name: "salvage-scout",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3003",
      },
      testMatch: "**/salvage-scout/**/*.spec.ts",
    },
    {
      name: "salvage-scout-mobile",
      use: {
        ...devices["iPhone 14"],
        baseURL: "http://localhost:3003",
      },
      testMatch: "**/salvage-scout/**/*.spec.ts",
    },
  ],
  webServer: [
    {
      command: "npm run dev",
      cwd: "../apprentice-log",
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: "npm run dev",
      cwd: "../bio-swap",
      port: 3002,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: "npm run dev",
      cwd: "../salvage-scout",
      port: 3003,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
