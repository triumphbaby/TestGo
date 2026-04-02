/**
 * 探测脚本 2：登录后找到 AI 设置页面入口
 */
import { test } from '@playwright/test';

const NAS_URL = 'http://192.168.31.75';
const USERNAME = 'admin';
const PASSWORD = 'Test2025';

async function login(page) {
  await page.goto(NAS_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const usernameInput = page.locator('input[placeholder="您的用户名"]');
  if (await usernameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await usernameInput.fill(USERNAME);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.waitForTimeout(500);
    // 点击登录按钮（可能需要先等按钮变为可用）
    await page.locator('button:has-text("登录")').click({ force: true });
    await page.waitForTimeout(5000);
  }
}

test('从桌面探测导航到AI设置', async ({ page }) => {
  await login(page);
  await page.screenshot({ path: 'screenshots/10-desktop.png', fullPage: true });

  // 1. 尝试点击右上角设置图标（齿轮图标通常在右上角）
  const topRightIcons = await page.$$('header svg, header img, .topbar svg, .topbar img, [class*="header"] svg');
  console.log(`右上角图标数: ${topRightIcons.length}`);

  // 2. 尝试点击左上角应用启动器（九宫格图标）
  const launcher = page.locator('[class*="launcher"], [class*="app-grid"], [class*="menu"]').first();
  if (await launcher.isVisible({ timeout: 3000 }).catch(() => false)) {
    await launcher.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/11-launcher.png', fullPage: true });
  }

  // 3. 输出所有可点击元素
  const clickables = await page.$$eval('[class*="icon"], [class*="dock"], [class*="app"], [role="button"]', els =>
    els.slice(0, 40).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().substring(0, 30),
      class: el.className?.toString().substring(0, 80),
      title: el.getAttribute('title') || '',
    }))
  );
  console.log('=== 可点击元素 ===');
  console.log(JSON.stringify(clickables, null, 2));

  // 4. 尝试在左上角九宫格旁的图标点击
  const topLeftBtns = page.locator('header >> nth=0').locator('div, span, button').first();

  // 5. 直接搜索页面中所有包含"设置"或"AI"文字的元素
  const settingsEls = await page.$$eval('*', els =>
    els.filter(el => {
      const t = el.textContent?.trim() || '';
      return (t.includes('设置') || t.includes('AI') || t.includes('Settings')) && t.length < 20;
    }).slice(0, 20).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim(),
      class: el.className?.toString().substring(0, 60),
    }))
  );
  console.log('=== 包含"设置"/"AI"的元素 ===');
  console.log(JSON.stringify(settingsEls, null, 2));
});

test('点击右上角齿轮图标进入设置', async ({ page }) => {
  await login(page);
  await page.waitForTimeout(2000);

  // 尝试右上角最后一个图标（通常是设置/个人中心）
  const topRight = page.locator('.z-desktop-header-right, [class*="header-right"], [class*="top-bar"] >> nth=-1');

  // 点击右上角倒数几个图标挨个试
  const headerBtns = await page.locator('.z-desktop-header svg, [class*="desktop-header"] svg, [class*="topbar"] svg').all();
  console.log(`顶部图标数: ${headerBtns.length}`);

  for (let i = 0; i < Math.min(headerBtns.length, 8); i++) {
    try {
      await headerBtns[i].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `screenshots/12-click-icon-${i}.png`, fullPage: true });

      // 检查是否打开了设置窗口
      const settingsText = await page.locator('text=AI设置').isVisible({ timeout: 1000 }).catch(() => false);
      const settingsText2 = await page.locator('text=设置').isVisible({ timeout: 1000 }).catch(() => false);
      console.log(`图标 ${i}: AI设置可见=${settingsText}, 设置可见=${settingsText2}`);

      if (settingsText || settingsText2) {
        console.log(`找到设置入口！图标索引: ${i}`);
        break;
      }

      // 关闭可能打开的弹窗
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch(e) {
      console.log(`图标 ${i} 点击失败: ${e.message?.substring(0, 50)}`);
    }
  }

  // 也试试底部 dock 的图标
  const dockItems = await page.locator('[class*="dock"] [class*="item"], [class*="taskbar"] [class*="item"]').all();
  console.log(`Dock 图标数: ${dockItems.length}`);

  for (let i = 0; i < Math.min(dockItems.length, 10); i++) {
    const title = await dockItems[i].getAttribute('title').catch(() => '');
    const text = await dockItems[i].textContent().catch(() => '');
    console.log(`Dock ${i}: title="${title}", text="${text?.trim().substring(0, 20)}"`);
  }
});
