/**
 * AI 学习范围 (AI Learning Scope) - Playwright E2E Tests
 *
 * Target:    ZettOS NAS at http://192.168.31.75
 * Feature:   AI Settings > AI Service > Learning Scope (学习范围)
 * Coverage:  TC_AILSCOPE_001, 002, 003, 006, 008, 013, 018
 *
 * UI framework: Element Plus (el-select, el-switch, el-dialog, el-tree, etc.)
 * Language:     Chinese (zh-CN)
 *
 * Each test is independent: login -> navigate -> execute -> cleanup.
 */

const { test, expect } = require('@playwright/test');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAS_URL = 'http://192.168.31.75';
const USERNAME = 'admin';
const PASSWORD = 'Test2025';

/** Dropdown option labels (Chinese UI text) */
const SCOPE_ALL     = '学习所有文件';
const SCOPE_EXCLUDE = '排除指定文件夹';
const SCOPE_INCLUDE = '仅学指定文件夹';

/** General timeout for NAS interactions (real hardware is slower) */
const ACTION_TIMEOUT = 30_000;

/** Screenshot output directory */
const SCREENSHOT_DIR = 'screenshots/learning-scope';

// ---------------------------------------------------------------------------
// Configure test suite defaults
// ---------------------------------------------------------------------------

test.describe.configure({ mode: 'serial' });

// ---------------------------------------------------------------------------
// Helper: Screenshot with descriptive name
// ---------------------------------------------------------------------------

/**
 * Take a full-page screenshot for debugging. Non-fatal on failure.
 */
async function capture(page, label) {
  try {
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/${label}.png`,
      fullPage: true,
    });
  } catch (_) {
    // Swallow screenshot errors so they never fail a test
  }
}

// ---------------------------------------------------------------------------
// Helper: Login to ZettOS
// ---------------------------------------------------------------------------

/**
 * Perform a fresh login from the login page.
 *   - Navigate to the NAS root URL
 *   - Fill username (placeholder contains "用户名" or "账号")
 *   - Fill password
 *   - Click login button
 *   - Wait for the desktop to load
 */
async function login(page) {
  await page.goto(NAS_URL, { waitUntil: 'domcontentloaded', timeout: ACTION_TIMEOUT });
  await page.waitForTimeout(3000);

  // Detect if we are already on the desktop (session cookie still valid)
  const launcherIcon = page.locator('i.icon-a-icon-menu2-011');
  const alreadyLoggedIn = await launcherIcon.isVisible({ timeout: 5000 }).catch(() => false);
  if (alreadyLoggedIn) {
    return; // Already on the desktop, skip login
  }

  // Locate the username field by multiple possible placeholders
  const usernameInput = page.locator(
    'input[placeholder*="用户名"], input[placeholder*="账号"], input[placeholder*="Username"]'
  ).first();
  await usernameInput.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
  await usernameInput.fill(USERNAME);

  // Fill password
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill(PASSWORD);

  await page.waitForTimeout(500);

  // Click the login button
  const loginBtn = page.locator(
    'button:has-text("登录"), button:has-text("登 录"), button:has-text("Login"), button[type="submit"]'
  ).first();
  await loginBtn.click({ force: true });

  // Wait for desktop to fully render (launcher icon appears)
  await launcherIcon.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
  await page.waitForTimeout(2000);
}

// ---------------------------------------------------------------------------
// Helper: Navigate to AI Settings > AI Service page
// ---------------------------------------------------------------------------

/**
 * From the desktop, open the Settings app and navigate to the
 * AI Settings > AI Service (AI 服务) page where the learning scope lives.
 */
async function navigateToAISettings(page) {
  // Step 1: Click the app launcher icon (nine-dot grid in top-left)
  const launcher = page.locator('i.icon-a-icon-menu2-011');
  await launcher.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
  await launcher.click();
  await page.waitForTimeout(2000);

  // Step 2: Click the "设置" (Settings) app card
  const settingsCard = page.locator(
    '.cardApp:has-text("设置"), .app-card-container:has-text("设置")'
  ).first();
  await settingsCard.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
  await settingsCard.click();
  await page.waitForTimeout(3000);

  // Step 3: Click the "AI 设置" left-sidebar menu item
  const aiSettingsMenu = page.locator(
    '.list-item:has-text("AI 设置"), .list-item:has-text("AI设置"), :text("AI 设置")'
  ).first();
  await aiSettingsMenu.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
  await aiSettingsMenu.click();
  await page.waitForTimeout(2000);

  // Step 4: Ensure we are on the "AI 服务" sub-tab (click it if visible)
  const aiServiceTab = page.locator(
    '.list-item:has-text("AI 服务"), .list-item:has-text("AI服务"), :text("AI 服务")'
  ).first();
  const serviceTabVisible = await aiServiceTab.isVisible({ timeout: 3000 }).catch(() => false);
  if (serviceTabVisible) {
    await aiServiceTab.click();
    await page.waitForTimeout(2000);
  }
}

// ---------------------------------------------------------------------------
// Helper: Ensure ZettAI switch is ON
// ---------------------------------------------------------------------------

/**
 * Check the ZettAI toggle switch on the AI Service page.
 * If it is off, click it and handle any confirmation dialog.
 */
async function ensureAIOn(page) {
  const aiSwitch = page.locator('.el-switch').first();
  if (!(await aiSwitch.isVisible({ timeout: 5000 }).catch(() => false))) return;

  const switchClass = await aiSwitch.getAttribute('class') || '';
  if (!switchClass.includes('is-checked')) {
    await aiSwitch.click();
    await page.waitForTimeout(1500);

    // Handle potential confirmation dialog
    await dismissConfirmDialog(page);
    await page.waitForTimeout(3000);
  }
}

// ---------------------------------------------------------------------------
// Helper: Ensure ZettAI switch is OFF
// ---------------------------------------------------------------------------

/**
 * Turn the ZettAI toggle OFF if it is currently ON.
 */
async function ensureAIOff(page) {
  const aiSwitch = page.locator('.el-switch').first();
  if (!(await aiSwitch.isVisible({ timeout: 5000 }).catch(() => false))) return;

  const switchClass = await aiSwitch.getAttribute('class') || '';
  if (switchClass.includes('is-checked')) {
    await aiSwitch.click();
    await page.waitForTimeout(1500);

    // Handle potential confirmation dialog ("确认关闭" / "确定")
    await dismissConfirmDialog(page);
    await page.waitForTimeout(3000);
  }
}

// ---------------------------------------------------------------------------
// Helper: Dismiss confirmation dialog
// ---------------------------------------------------------------------------

/**
 * If an Element Plus confirmation dialog (MessageBox / Dialog) is visible,
 * click the primary confirm button to dismiss it.
 */
async function dismissConfirmDialog(page) {
  const confirmBtn = page.locator([
    '.el-message-box__btns .el-button--primary',
    '.el-message-box__btns button:has-text("确")',
    '.el-dialog button:has-text("确认")',
    '.el-dialog button:has-text("确定")',
  ].join(', ')).last();

  if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmBtn.click();
    await page.waitForTimeout(2000);
  }
}

// ---------------------------------------------------------------------------
// Helper: Select a learning scope option from the dropdown
// ---------------------------------------------------------------------------

/**
 * Open the "学习范围" dropdown and choose a specific option by its text.
 * @param {import('@playwright/test').Page} page
 * @param {string} optionText - One of SCOPE_ALL, SCOPE_EXCLUDE, SCOPE_INCLUDE
 */
async function selectScope(page, optionText) {
  // The dropdown is an el-select near the "学习范围" label.
  // Click the trigger to open the option list.
  const scopeSelect = page.locator('.el-select').filter({
    has: page.locator(`text="${SCOPE_ALL}"`).or(
         page.locator(`text="${SCOPE_EXCLUDE}"`)).or(
         page.locator(`text="${SCOPE_INCLUDE}"`))
  }).first();

  // Fallback: find any el-select whose visible text matches known scope options
  let trigger = scopeSelect.locator('.el-select__wrapper, .el-input__wrapper').first();
  let triggerVisible = await trigger.isVisible({ timeout: 5000 }).catch(() => false);

  if (!triggerVisible) {
    // Broader fallback: find el-select near the "学习范围" heading
    const scopeSection = page.locator(':text("学习范围")').first();
    trigger = scopeSection.locator('..').locator('.el-select .el-select__wrapper, .el-select .el-input__wrapper').first();
    triggerVisible = await trigger.isVisible({ timeout: 5000 }).catch(() => false);
  }

  if (!triggerVisible) {
    // Last resort: use any visible el-select wrapper on the page
    trigger = page.locator('.el-select .el-select__wrapper, .el-select .el-input__wrapper').first();
  }

  await trigger.click();
  await page.waitForTimeout(1000);

  // Click the target option in the dropdown overlay
  const option = page.locator('.el-select-dropdown__item, .el-select-dropdown__option-item').filter({
    hasText: optionText,
  }).first();
  await option.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
  await option.click();
  await page.waitForTimeout(1500);

  // Dismiss any lingering dropdown by clicking empty space
  await page.locator('body').click({ position: { x: 10, y: 10 } });
  await page.waitForTimeout(500);
}

// ---------------------------------------------------------------------------
// Helper: Get the currently selected scope text
// ---------------------------------------------------------------------------

async function getCurrentScope(page) {
  // Read the visible text inside the scope el-select
  const selectText = page.locator('.el-select').filter({
    has: page.locator(`text="${SCOPE_ALL}"`).or(
         page.locator(`text="${SCOPE_EXCLUDE}"`)).or(
         page.locator(`text="${SCOPE_INCLUDE}"`))
  }).first();

  const visible = await selectText.isVisible({ timeout: 5000 }).catch(() => false);
  if (visible) {
    return (await selectText.textContent() || '').trim();
  }
  // Fallback: read the full page body for the scope keyword
  const body = await page.textContent('body');
  if (body.includes(SCOPE_ALL)) return SCOPE_ALL;
  if (body.includes(SCOPE_EXCLUDE)) return SCOPE_EXCLUDE;
  if (body.includes(SCOPE_INCLUDE)) return SCOPE_INCLUDE;
  return '';
}

// ---------------------------------------------------------------------------
// Helper: Click the save button in the bottom prompt bar
// ---------------------------------------------------------------------------

async function clickSave(page) {
  // The save button is a purple button with text "保存" in the bottom bar
  const saveBtn = page.locator(
    'button:has-text("保存")'
  ).last();
  await saveBtn.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
  await saveBtn.click({ force: true });
  await page.waitForTimeout(2000);
}

// ---------------------------------------------------------------------------
// Helper: Reset scope back to "学习所有文件" and save (cleanup)
// ---------------------------------------------------------------------------

async function resetScopeToAll(page) {
  try {
    const currentScope = await getCurrentScope(page);
    if (!currentScope.includes(SCOPE_ALL)) {
      await selectScope(page, SCOPE_ALL);
      // If a save button is visible after switching, click it
      const saveBtn = page.locator('button:has-text("保存")').last();
      const saveVisible = await saveBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (saveVisible) {
        await saveBtn.click({ force: true });
        await page.waitForTimeout(2000);
      }
    }
  } catch (_) {
    // Cleanup is best-effort; do not fail the test
  }
}

// ===========================================================================
// Test Suite
// ===========================================================================

test.describe('AI Learning Scope (AI 学习范围)', () => {

  // Set generous timeout for all tests (real NAS hardware)
  test.setTimeout(120_000);

  // -----------------------------------------------------------------------
  // After each test: reset scope to default so tests remain independent
  // -----------------------------------------------------------------------
  test.afterEach(async ({ page }) => {
    try {
      await ensureAIOn(page);
      await resetScopeToAll(page);
    } catch (_) {
      // Best-effort cleanup
    }
    await capture(page, 'afterEach-cleanup');
  });

  // =========================================================================
  // TC_AILSCOPE_002 (P1): Default scope is "学习所有文件", no table visible
  // =========================================================================

  test('TC_AILSCOPE_002: default scope is "学习所有文件" with no exclusion table', async ({ page }) => {
    // --- Setup ---
    await login(page);
    await navigateToAISettings(page);
    await ensureAIOn(page);
    await capture(page, 'TC002-01-initial');

    // First, make sure we are at the default by resetting
    await resetScopeToAll(page);
    // Reload to ensure we see the persisted default state
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await navigateToAISettings(page);
    await ensureAIOn(page);
    await capture(page, 'TC002-02-after-reload');

    // --- Assert: dropdown shows "学习所有文件" ---
    const scopeText = await getCurrentScope(page);
    expect(scopeText).toContain(SCOPE_ALL);

    // --- Assert: no folder rule table visible ---
    // The table header "路径名称" should NOT appear in "学习所有文件" mode
    const tableHeader = page.locator('text="路径名称"');
    await expect(tableHeader).not.toBeVisible({ timeout: 5000 });

    // --- Assert: "+添加" button should NOT be visible ---
    const addBtn = page.locator('button:has-text("+添加"), button:has-text("添加")').first();
    await expect(addBtn).not.toBeVisible({ timeout: 5000 });

    await capture(page, 'TC002-03-verified');
  });

  // =========================================================================
  // TC_AILSCOPE_003 (P1): Switch to "排除指定文件夹" shows empty state
  // =========================================================================

  test('TC_AILSCOPE_003: switching to "排除指定文件夹" shows empty table', async ({ page }) => {
    // --- Setup ---
    await login(page);
    await navigateToAISettings(page);
    await ensureAIOn(page);
    await resetScopeToAll(page);
    await capture(page, 'TC003-01-initial');

    // --- Action: select "排除指定文件夹" ---
    await selectScope(page, SCOPE_EXCLUDE);
    await capture(page, 'TC003-02-exclude-selected');

    // --- Assert: empty state text "暂未添加" is visible ---
    const emptyText = page.locator('text="暂未添加"');
    await expect(emptyText).toBeVisible({ timeout: ACTION_TIMEOUT });

    // --- Assert: "+添加" button is visible ---
    const addBtn = page.locator('button:has-text("+添加"), button:has-text("添加")').first();
    await expect(addBtn).toBeVisible({ timeout: ACTION_TIMEOUT });

    // --- Assert: table header "路径名称" is visible ---
    const tableHeader = page.locator('text="路径名称"');
    await expect(tableHeader).toBeVisible({ timeout: ACTION_TIMEOUT });

    await capture(page, 'TC003-03-verified');
  });

  // =========================================================================
  // TC_AILSCOPE_006 (P1): Save prompt bar appears after modification
  // =========================================================================

  test('TC_AILSCOPE_006: save prompt bar appears after scope change', async ({ page }) => {
    // --- Setup ---
    await login(page);
    await navigateToAISettings(page);
    await ensureAIOn(page);
    await resetScopeToAll(page);
    await capture(page, 'TC006-01-initial');

    // --- Action: switch to "排除指定文件夹" to trigger modification ---
    await selectScope(page, SCOPE_EXCLUDE);
    await capture(page, 'TC006-02-after-switch');

    // --- Assert: bottom prompt bar shows the save hint text ---
    // The exact text from the Figma design: "修改学习范围后，需要点击保存后生效"
    const saveHint = page.locator('text=/修改学习范围后.*保存.*生效/');
    await expect(saveHint).toBeVisible({ timeout: ACTION_TIMEOUT });

    // --- Assert: purple "保存" (save) button is visible ---
    const saveBtn = page.locator('button:has-text("保存")').last();
    await expect(saveBtn).toBeVisible({ timeout: ACTION_TIMEOUT });

    // Optionally verify the button has a purple background (bg color #6155f5)
    const btnBgColor = await saveBtn.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // Log for debugging; the purple color is rgb(97, 85, 245) = #6155f5
    console.log(`Save button background-color: ${btnBgColor}`);

    await capture(page, 'TC006-03-prompt-visible');

    // --- Action: click save ---
    await saveBtn.click({ force: true });
    await page.waitForTimeout(2000);

    // --- Assert: prompt bar disappears after save ---
    await expect(saveHint).not.toBeVisible({ timeout: ACTION_TIMEOUT });

    await capture(page, 'TC006-04-after-save');
  });

  // =========================================================================
  // TC_AILSCOPE_008 (P1): Learning scope hidden/disabled when AI is OFF
  // =========================================================================

  test('TC_AILSCOPE_008: learning scope not visible when ZettAI is off', async ({ page }) => {
    // --- Setup ---
    await login(page);
    await navigateToAISettings(page);
    await ensureAIOn(page);
    await capture(page, 'TC008-01-ai-on');

    // Verify "学习范围" is visible when AI is ON
    const scopeLabel = page.locator('text="学习范围"').first();
    await expect(scopeLabel).toBeVisible({ timeout: ACTION_TIMEOUT });

    // --- Action: turn AI OFF ---
    await ensureAIOff(page);
    await capture(page, 'TC008-02-ai-off');

    // --- Assert: "学习范围" section is not visible or disabled ---
    // When ZettAI is off, the learning scope section should be hidden
    await expect(scopeLabel).not.toBeVisible({ timeout: ACTION_TIMEOUT });

    await capture(page, 'TC008-03-scope-hidden');

    // --- Cleanup: turn AI back on ---
    await ensureAIOn(page);
    await page.waitForTimeout(2000);
    await capture(page, 'TC008-04-ai-restored');

    // Verify scope label is visible again
    await expect(scopeLabel).toBeVisible({ timeout: ACTION_TIMEOUT });
  });

  // =========================================================================
  // TC_AILSCOPE_013 (P1): Empty list in "仅学指定文件夹" blocks save
  // =========================================================================

  test('TC_AILSCOPE_013: empty folder list in "仅学指定文件夹" mode blocks save', async ({ page }) => {
    // --- Setup ---
    await login(page);
    await navigateToAISettings(page);
    await ensureAIOn(page);
    await resetScopeToAll(page);
    await capture(page, 'TC013-01-initial');

    // --- Action: switch to "仅学指定文件夹" ---
    await selectScope(page, SCOPE_INCLUDE);
    await capture(page, 'TC013-02-include-selected');

    // --- Action: click save WITHOUT adding any folders ---
    const saveBtn = page.locator('button:has-text("保存")').last();
    const saveBtnVisible = await saveBtn.isVisible({ timeout: 5000 }).catch(() => false);
    expect(saveBtnVisible).toBeTruthy();

    await saveBtn.click({ force: true });
    await page.waitForTimeout(2000);
    await capture(page, 'TC013-03-after-save-attempt');

    // --- Assert: error message appears (toast / message) ---
    // Expected message: "请至少添加一个文件夹" or similar
    const errorMsg = page.locator([
      '.el-message:has-text("至少添加")',
      '.el-message:has-text("至少")',
      '.el-message--error',
      '.el-message--warning',
      '.el-notification:has-text("至少")',
      'text=/请至少添加.*文件夹/',
    ].join(', ')).first();

    await expect(errorMsg).toBeVisible({ timeout: ACTION_TIMEOUT });

    // Log the error message text for debugging
    const errorText = await errorMsg.textContent().catch(() => '');
    console.log(`Error message: ${errorText}`);

    await capture(page, 'TC013-04-error-shown');
  });

  // =========================================================================
  // TC_AILSCOPE_018 (P1): Empty exclusion list allows save
  // =========================================================================

  test('TC_AILSCOPE_018: empty exclusion list in "排除指定文件夹" allows save', async ({ page }) => {
    // --- Setup ---
    await login(page);
    await navigateToAISettings(page);
    await ensureAIOn(page);
    await resetScopeToAll(page);
    await capture(page, 'TC018-01-initial');

    // --- Action: switch to "排除指定文件夹" without adding folders ---
    await selectScope(page, SCOPE_EXCLUDE);
    await capture(page, 'TC018-02-exclude-empty');

    // --- Action: click save ---
    await clickSave(page);
    await capture(page, 'TC018-03-after-save');

    // --- Assert: save succeeds (success toast notification appears) ---
    const successToast = page.locator([
      '.el-message--success',
      '.el-message:has-text("成功")',
      '.el-message:has-text("保存成功")',
      '.el-notification:has-text("成功")',
    ].join(', ')).first();
    await expect(successToast).toBeVisible({ timeout: ACTION_TIMEOUT });

    // Log the success message
    const toastText = await successToast.textContent().catch(() => '');
    console.log(`Success toast: ${toastText}`);

    // --- Assert: save prompt bar disappears ---
    const saveHint = page.locator('text=/修改学习范围后.*保存.*生效/');
    await expect(saveHint).not.toBeVisible({ timeout: ACTION_TIMEOUT });

    await capture(page, 'TC018-04-verified');
  });

  // =========================================================================
  // TC_AILSCOPE_001 (P0): Exclude folder end-to-end flow
  // =========================================================================

  test('TC_AILSCOPE_001: exclude folder end-to-end flow', async ({ page }) => {
    // --- Setup ---
    await login(page);
    await navigateToAISettings(page);
    await ensureAIOn(page);
    await resetScopeToAll(page);
    await capture(page, 'TC001-01-initial');

    // --- Step 1: Switch to "排除指定文件夹" ---
    await selectScope(page, SCOPE_EXCLUDE);
    await capture(page, 'TC001-02-exclude-selected');

    // Verify empty state
    const emptyText = page.locator('text="暂未添加"');
    await expect(emptyText).toBeVisible({ timeout: ACTION_TIMEOUT });

    // --- Step 2: Click "+添加" to open folder picker ---
    const addBtn = page.locator('button:has-text("+添加"), button:has-text("添加")').first();
    await expect(addBtn).toBeVisible({ timeout: ACTION_TIMEOUT });
    await addBtn.click();
    await page.waitForTimeout(2000);
    await capture(page, 'TC001-03-picker-opened');

    // --- Step 3: Interact with the folder picker dialog ---
    const dialog = page.locator('.el-dialog').last();
    await expect(dialog).toBeVisible({ timeout: ACTION_TIMEOUT });

    // Wait for the directory tree to load
    const treeNode = dialog.locator('.el-tree-node').first();
    await treeNode.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
    await page.waitForTimeout(1000);
    await capture(page, 'TC001-04-tree-loaded');

    // Expand the first root node (e.g., "团队空间") if not already expanded
    const firstRootExpander = treeNode.locator('.el-tree-node__expand-icon').first();
    const hasChildren = await treeNode.locator('.el-tree-node__children').isVisible().catch(() => false);
    if (!hasChildren) {
      const expanderVisible = await firstRootExpander.isVisible().catch(() => false);
      if (expanderVisible) {
        await firstRootExpander.click();
        await page.waitForTimeout(2000);
      }
    }
    await capture(page, 'TC001-05-tree-expanded');

    // --- Step 4: Select a child folder from the tree ---
    const childFolder = dialog.locator('.el-tree-node__children .el-tree-node__content').first();
    const childVisible = await childFolder.isVisible({ timeout: 5000 }).catch(() => false);
    if (childVisible) {
      await childFolder.click();
      await page.waitForTimeout(1000);
    }
    await capture(page, 'TC001-06-folder-selected');

    // Click the confirm button in the dialog
    const confirmBtn = dialog.locator(
      'button:has-text("确认"), button:has-text("确定")'
    ).first();
    await confirmBtn.click({ timeout: ACTION_TIMEOUT });
    await page.waitForTimeout(2000);
    await capture(page, 'TC001-07-after-confirm');

    // --- Step 5: Assert the folder now appears in the exclusion list ---
    // The empty state text should be gone
    await expect(emptyText).not.toBeVisible({ timeout: ACTION_TIMEOUT });

    // There should be at least one path entry in the table
    // Path entries are near the "路径名称" table header, displayed as folder paths
    const tableRows = page.locator('text=/\\/.*\\//).first(); // Matches a path like /This_NAS/...
    const tableRowVisible = await tableRows.isVisible({ timeout: 5000 }).catch(() => false);
    // If specific path matching fails, verify "暂未添加" is gone as confirmation
    expect(
      tableRowVisible ||
      !(await emptyText.isVisible().catch(() => false))
    ).toBeTruthy();

    await capture(page, 'TC001-08-folder-in-list');

    // --- Step 6: Click save and verify success ---
    const saveBtn = page.locator('button:has-text("保存")').last();
    await expect(saveBtn).toBeVisible({ timeout: ACTION_TIMEOUT });
    await saveBtn.click({ force: true });
    await page.waitForTimeout(2000);
    await capture(page, 'TC001-09-after-save');

    // Assert success toast appears
    const successToast = page.locator([
      '.el-message--success',
      '.el-message:has-text("成功")',
      '.el-message:has-text("保存成功")',
      '.el-notification:has-text("成功")',
    ].join(', ')).first();
    await expect(successToast).toBeVisible({ timeout: ACTION_TIMEOUT });

    const toastText = await successToast.textContent().catch(() => '');
    console.log(`Save success toast: ${toastText}`);

    // Assert save prompt bar disappears
    const saveHint = page.locator('text=/修改学习范围后.*保存.*生效/');
    await expect(saveHint).not.toBeVisible({ timeout: ACTION_TIMEOUT });

    await capture(page, 'TC001-10-final');
  });
});
