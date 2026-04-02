/**
 * 探测脚本：截取登录页 & AI 设置页的 DOM 结构和截图
 * 用于确定后续测试脚本的选择器
 */
import { test, expect } from '@playwright/test';

const NAS_URL = 'http://192.168.31.75';
const USERNAME = 'admin';
const PASSWORD = 'Test2025';

test('探测登录页结构', async ({ page }) => {
  await page.goto(NAS_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/01-login-page.png', fullPage: true });

  // 输出页面中所有 input 元素信息
  const inputs = await page.$$eval('input', els =>
    els.map(el => ({
      type: el.type,
      placeholder: el.placeholder,
      name: el.name,
      id: el.id,
      class: el.className,
    }))
  );
  console.log('=== INPUT 元素 ===');
  console.log(JSON.stringify(inputs, null, 2));

  // 输出所有 button 元素
  const buttons = await page.$$eval('button', els =>
    els.map(el => ({
      text: el.textContent?.trim(),
      class: el.className,
      type: el.type,
    }))
  );
  console.log('=== BUTTON 元素 ===');
  console.log(JSON.stringify(buttons, null, 2));
});

test('探测登录流程并进入AI设置页', async ({ page }) => {
  await page.goto(NAS_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 尝试登录
  const usernameInput = page.locator('input[type="text"], input[name="username"], input[placeholder*="用户"], input[placeholder*="user"], input[placeholder*="账号"]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  if (await usernameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await usernameInput.fill(USERNAME);
    await passwordInput.fill(PASSWORD);
    await page.screenshot({ path: 'screenshots/02-login-filled.png', fullPage: true });

    // 点击登录按钮
    const loginBtn = page.locator('button:has-text("登录"), button:has-text("Login"), button[type="submit"]').first();
    await loginBtn.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/03-after-login.png', fullPage: true });

    console.log('=== 登录后 URL ===');
    console.log(page.url());
  } else {
    console.log('未找到用户名输入框，可能已登录');
    await page.screenshot({ path: 'screenshots/02-already-logged-in.png', fullPage: true });
  }

  // 尝试导航到 AI 设置页面
  // 先查找左侧菜单中的 "AI设置" 或 "设置"
  const allLinks = await page.$$eval('a, [role="menuitem"], .menu-item, .nav-item', els =>
    els.map(el => ({
      text: el.textContent?.trim().substring(0, 50),
      href: (el as HTMLAnchorElement).href || '',
      class: el.className?.substring(0, 80),
    }))
  );
  console.log('=== 导航链接 ===');
  console.log(JSON.stringify(allLinks.filter(l => l.text && l.text.length > 0).slice(0, 30), null, 2));

  // 尝试直接访问可能的 AI 设置路径
  const possiblePaths = [
    '/settings/ai',
    '/ai-settings',
    '/settings/ai-service',
    '/#/settings/ai',
    '/#/ai-settings',
  ];

  for (const path of possiblePaths) {
    await page.goto(`${NAS_URL}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const title = await page.title();
    const url = page.url();
    console.log(`路径 ${path} => URL: ${url}, Title: ${title}`);
  }

  await page.screenshot({ path: 'screenshots/04-ai-settings-attempt.png', fullPage: true });
});
