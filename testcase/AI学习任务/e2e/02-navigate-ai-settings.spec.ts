/**
 * 精准探测：登录 → 打开设置 → 导航到 AI 设置 → AI 服务 → 学习范围
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
    await page.locator('button:has-text("登录")').click({ force: true });
    await page.waitForTimeout(5000);
  }
}

test('完整导航到AI设置页面', async ({ page }) => {
  await login(page);
  console.log('登录后 URL:', page.url());

  // Step 1: 点击左上角应用启动器（九宫格图标 icon-a-icon-menu2-011）
  const launcherIcon = page.locator('i.icon-a-icon-menu2-011');
  if (await launcherIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
    await launcherIcon.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/20-launcher-open.png', fullPage: true });
    console.log('启动器已打开');
  }

  // Step 2: 点击 "设置" 应用卡片
  const settingsCard = page.locator('.cardApp:has-text("设置"), .app-card-container:has-text("设置")').first();
  if (await settingsCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await settingsCard.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/21-settings-opened.png', fullPage: true });
    console.log('设置应用已打开, URL:', page.url());
  }

  // Step 3: 查找设置页面中的所有菜单项
  const menuItems = await page.$$eval('[class*="menu"] [class*="item"], [class*="sidebar"] [class*="item"], [class*="nav"] a, [class*="nav"] [class*="item"]', els =>
    els.slice(0, 30).map(el => ({
      text: el.textContent?.trim().substring(0, 30),
      class: el.className?.toString().substring(0, 60),
    }))
  );
  console.log('=== 设置页菜单项 ===');
  console.log(JSON.stringify(menuItems.filter(m => m.text), null, 2));

  // Step 4: 查找包含 "AI" 的菜单项
  const aiMenu = page.locator('[class*="menu"] :text("AI"), [class*="sidebar"] :text("AI"), [class*="nav"] :text("AI")').first();
  if (await aiMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
    await aiMenu.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/22-ai-settings.png', fullPage: true });
    console.log('AI设置菜单已点击');
  } else {
    // 直接搜索所有文本
    const allText = await page.$$eval('*', els =>
      els.filter(el => {
        const t = el.textContent?.trim() || '';
        return t.length > 0 && t.length < 20 && (t.includes('AI') || t.includes('设置') || t.includes('服务'));
      }).slice(0, 20).map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim(),
        class: el.className?.toString().substring(0, 60),
      }))
    );
    console.log('=== 含 AI/设置/服务 的元素 ===');
    console.log(JSON.stringify(allText, null, 2));
  }

  // Step 5: 查找 "AI 服务" tab
  const aiServiceTab = page.locator(':text("AI 服务"), :text("AI服务")').first();
  if (await aiServiceTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await aiServiceTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/23-ai-service.png', fullPage: true });
    console.log('AI 服务 tab 已点击');
  }

  // Step 6: 查找 "学习范围" 区域
  const scopeArea = page.locator(':text("学习范围")').first();
  if (await scopeArea.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.screenshot({ path: 'screenshots/24-learning-scope.png', fullPage: true });
    console.log('学习范围区域可见！');
  }

  // 最终截图
  await page.screenshot({ path: 'screenshots/25-final-state.png', fullPage: true });

  // 输出页面中所有下拉框和按钮
  const controls = await page.$$eval('select, [class*="select"], [class*="dropdown"], button', els =>
    els.slice(0, 20).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().substring(0, 40),
      class: el.className?.toString().substring(0, 60),
    }))
  );
  console.log('=== 页面控件 ===');
  console.log(JSON.stringify(controls, null, 2));
});
