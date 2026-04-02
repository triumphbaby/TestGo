/**
 * 全局登录 setup：登录一次，保存浏览器状态供后续所有测试复用
 */
import { test as setup } from '@playwright/test';

const NAS_URL = 'http://192.168.31.75';
const USERNAME = 'admin';
const PASSWORD = 'Test2025';
const AUTH_FILE = '.auth/user.json';

setup('登录 NAS 并保存会话', async ({ page }) => {
  await page.goto(NAS_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 填写登录表单
  const usernameInput = page.locator('input[placeholder="您的用户名"]');
  if (await usernameInput.isVisible({ timeout: 8000 }).catch(() => false)) {
    await usernameInput.fill(USERNAME);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("登录")').click({ force: true });

    // 等待桌面加载完成
    await page.locator('i.icon-a-icon-menu2-011').waitFor({ timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('登录成功，URL:', page.url());
  }

  // 保存浏览器会话状态（cookies + localStorage）
  await page.context().storageState({ path: AUTH_FILE });
  console.log('会话已保存到', AUTH_FILE);
});
