import { defineConfig, devices } from "@playwright/test";

// E2E / DOM-integration suite. Runs the real islands against the PRODUCTION build
// (astro build + astro preview), with a second origin serving the embed stub child so the
// cross-origin postMessage handshake is exercised honestly. See e2e/helpers/harness.ts.
// A dedicated preview port (not Astro's default 4321) so the suite never collides with or
// silently reuses a running dev server: it must test the production build, not the dev output.
const PREVIEW_PORT = 4329;
const STUB_PORT = 4399;

export default defineConfig({
  testDir: "./e2e",
  // The suite is small and high-signal; serialise to keep the timing-sensitive embed lifecycle
  // deterministic (idle callbacks, handshake ceilings) rather than fighting for CPU in parallel.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PREVIEW_PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Disable Chromium's Local Network Access checks: they block the embed iframe's
        // localhost:PREVIEW -> localhost:STUB request (ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS).
        // The handshake under test is public-origin to public-origin in production, where LNA does
        // not apply; the block is an artifact of both servers being on localhost in the test.
        launchOptions: { args: ["--disable-features=LocalNetworkAccessChecks"] },
      },
    },
  ],
  webServer: [
    {
      // Build then preview, so the suite always runs the real static output, not the dev server.
      // reuseExistingServer is off so every run rebuilds and tests the current source.
      command: `pnpm build && pnpm preview --port ${PREVIEW_PORT}`,
      url: `http://localhost:${PREVIEW_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: "node e2e/stub/server.mjs",
      url: `http://localhost:${STUB_PORT}`,
      env: { STUB_PORT: String(STUB_PORT) },
      reuseExistingServer: false,
      timeout: 30_000,
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
});
