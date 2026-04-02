/**
 * 共享工具函数：导航到 AI 设置学习范围页面
 * 注意：登录由 auth.setup.ts 统一处理，这里只负责导航
 */
import { Page } from '@playwright/test';

export const NAS_URL = 'http://192.168.31.75';
export const SCREENSHOT_DIR = 'screenshots';

/** 确保进入桌面（利用已保存的 cookie，无需重新登录） */
export async function ensureDesktop(page: Page) {
  await page.goto(NAS_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // cookie 有效时会自动跳转到 desktop
  // 如果仍在登录页，等待自动重定向
  if (!page.url().includes('desktop')) {
    try {
      await page.locator('i.icon-a-icon-menu2-011').waitFor({ timeout: 15000 });
    } catch {
      // 如果 cookie 失效需要重新登录的场景，抛出明确错误
      throw new Error('Session expired - 请重新运行 setup 项目以刷新登录会话');
    }
  }
  await page.waitForTimeout(1000);
}

/** 导航到 AI 设置页面 */
export async function navigateToAISettings(page: Page) {
  // 点击应用启动器
  await page.locator('i.icon-a-icon-menu2-011').click();
  await page.waitForTimeout(1500);

  // 点击设置应用
  await page.locator('.cardApp:has-text("设置")').click();
  await page.waitForTimeout(2000);

  // 点击左侧 AI 设置菜单（展开子菜单）
  await page.locator('.list-item:has-text("AI 设置"), .list-item:has-text("AI设置")').click();
  await page.waitForTimeout(1500);

  // 点击 AI 服务 子菜单项（进入学习范围所在页面）
  await page.locator('.list-item:has-text("AI 服务"), .list-item:has-text("AI服务")').click();
  await page.waitForTimeout(3000);
}

/** 进入桌面 + 导航到 AI 设置（一步到位，不登录） */
export async function setupAISettings(page: Page) {
  await ensureDesktop(page);
  await navigateToAISettings(page);
}

/** 截图工具 */
export async function screenshot(page: Page, name: string) {
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${name}.png`,
    fullPage: true,
  });
}
