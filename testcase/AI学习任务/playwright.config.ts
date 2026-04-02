import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'test-report' }],
  ],
  use: {
    baseURL: 'http://192.168.31.75',
    screenshot: 'on',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    locale: 'zh-CN',
    ignoreHTTPSErrors: true,
  },
  outputDir: 'test-results',
  projects: [
    // 1. 先执行登录 setup（仅一次）
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { browserName: 'chromium', viewport: { width: 1920, height: 1080 } },
    },
    // 2. 所有测试复用登录后的会话
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        browserName: 'chromium',
        viewport: { width: 1920, height: 1080 },
        storageState: '.auth/user.json',
      },
    },
  ],
});
