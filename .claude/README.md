# TestGo - NAS QA 自动化工具集

基于 Claude Code 的 NAS 产品测试自动化平台，提供从 PRD 到测试报告的全流程 QA 能力。

## 快速开始

```bash
# 一条命令跑完整个 QA 流程
/全流程QA管线 prd/xxx.md --platform pc --no-testsprite

# 或单独使用某个环节
/测试策略生成 prd/xxx.md
/功能测试用例 prd/xxx.md
/测试用例评审 testcase/xxx.xlsx
```

---

## Skills 命令一览

### 核心编排

| 命令 | 说明 |
|------|------|
| `/全流程QA管线` | 5 阶段全流程编排：策略 → 用例 → 执行 → 分析 → 报告。支持 `--platform mobile\|pc`、`--figma`、`--no-testsprite` 等参数 |

### Phase 0 - 设计稿分析

| 命令 | 说明 |
|------|------|
| `/Figma设计稿分析` | 从 Figma 设计稿提取 UI 规格，生成结构化 UI Spec 文档 |

### Phase 1 - 策略

| 命令 | 说明 |
|------|------|
| `/测试策略生成` | 根据 PRD 自动生成测试策略文档（风险分析、测试范围、深度广度等 8 章） |

### Phase 2 - 用例设计

| 命令 | 说明 |
|------|------|
| `/功能测试用例` | 需求 → 功能测试用例 xlsx（P0 核心流程 / P1 等价类+边界值 / P2 异常容错） |
| `/兼容性测试用例` | 需求 → 兼容性测试用例 xlsx（浏览器、OS、分辨率、网络环境） |
| `/专项测试用例` | 需求 → 专项测试用例 xlsx（存储异常、安全、性能压力） |
| `/升级刷机测试用例` | 需求 → 升级刷机测试用例 xlsx（DB 脚本、OTA、刷机初始化） |
| `/Bugfix验证用例` | Bug 修复 → 三层验证用例（根因验证 / 症状验证 / 回归验证） |
| `/测试数据准备` | 根据用例文档生成配套测试数据准备文档 |
| `/测试用例评审` | 5 维度评审（需求覆盖率、规范性、场景完备性、NFR、UI/交互） |
| `/填充所属模块` | 批量填充 xlsx 中的「所属模块」路径字段 |

### Phase 3 - 测试执行

| 命令 | 说明 |
|------|------|
| `/测试执行` | 推送到 TestSprite 执行，失败时自动降级到本地 Playwright |

### Phase 4 - 分析优化

| 命令 | 说明 |
|------|------|
| `/用例分析与优化` | 分析执行结果，区分用例问题和产品 Bug，自动优化用例并生成 Bug 报告 |
| `/记录Bug` | 记录测试 Bug，自动创建 Jira 单 |
| `/AI QA Bug Agent` | 分析问题描述/截图/日志，生成结构化 Bug 报告 |

### Phase 5 - 报告

| 命令 | 说明 |
|------|------|
| `/缺陷统计报告` | 汇总所有轮次缺陷，生成统计分析报告 |
| `/测试报告` | 基于执行记录和缺陷报告，生成完整 9 章测试报告 |

### 辅助工具

| 命令 | 说明 |
|------|------|
| `/structure` | 树形展示当前项目目录结构 |
| `/更新问答记录` | 将对话问答追加到 conversation-qa.md |

---

## 项目结构

```
TestGo/
├── .claude/
│   ├── skills/                  ← 19 个 Skill 命令定义
│   ├── settings.local.json      ← 权限配置
│   └── README.md                ← 本文档
│
├── prd/                         ← 需求文档
│   ├── testcase-spec.md         ← 用例字段规范（核心共享）
│   ├── AI学习任务/
│   ├── AI模型管理/
│   ├── AI设置/
│   ├── ZettAgent/
│   ├── 云端会员付费/
│   └── 新设备初始化/
│
├── testcase/                    ← 测试产出（用例/策略/报告/脚本）
│   ├── AI学习任务/              ← 含 Playwright e2e 测试
│   ├── AI模型管理/
│   ├── CopySource_AI学习继承/
│   ├── ZettAgent/
│   ├── 云账号系统/
│   └── 新设备初始化/
│
├── example/                     ← 模板参考
│   ├── TestStrategy.md          ← 策略模板
│   ├── TestCase.md              ← 用例模板
│   ├── TestExecution.md         ← 执行记录模板
│   ├── BugReporting.md          ← 缺陷报告模板
│   ├── TestReport.md            ← 测试报告模板
│   └── agents.md                ← Agent 定义
│
├── doc/
│   └── QA-HowTo.md             ← QA 问答知识库
│
├── docs/
│   └── conversation-qa.md       ← 历史对话记录
│
└── scripts/                     ← 自动化脚本
```

### 每个 testcase 模块目录结构

```
testcase/{模块名}/
├── .pipeline-state-pc.json          ← QA 管线进度（PC 端）
├── {Module}_{Ver}_{plat}_Strategy.md ← 测试策略
├── {Module}_{Ver}_{plat}_PRD_Supplements.md ← PRD 补充清单
├── gen_testcases_pc.py              ← 用例生成脚本（Python + openpyxl）
├── {Module}_{Ver}_{plat}_Functional.xlsx    ← 功能测试用例
├── {Module}_{Ver}_{plat}_Review.md  ← 评审报告
├── e2e/                             ← Playwright 自动化测试（可选）
└── screenshots/                     ← 测试截图（可选）
```

---

## 全流程 QA 管线

```
Phase 0（可选）  Phase 1         Phase 2         Phase 3      Phase 4        Phase 5
Figma分析    →  策略+PRD反哺  →  用例设计+评审  →  测试执行  →  分析优化    →  报告
  │               │                │               │             │              │
UI Spec        Strategy.md     gen_testcases.py  Execution.md  Bug分类       Report.md
               Supplements.md  Functional.xlsx                 用例修正      BugReport.md
```

**每个阶段暂停等用户确认后才继续下一阶段。**

### 常用参数

```bash
# PC 端功能测试（最常用）
/全流程QA管线 prd/xxx.md --platform pc --no-testsprite

# 含 Figma 设计稿分析
/全流程QA管线 prd/xxx.md --platform pc --figma <figma-url> --no-testsprite

# 移动端
/全流程QA管线 prd/xxx.md --platform mobile --no-testsprite

# 多种用例类型
/全流程QA管线 prd/xxx.md --types functional,compatibility
```

---

## 测试环境

| 项目 | 值 |
|------|------|
| 设备 | Zettlab-D6-2772 (ZettOS NAS) |
| IP | 192.168.31.75:80 |
| 账号 | admin / Test2025 |
| CPU / RAM | RK3588 / 16GB |
| 前端框架 | Vue.js 微前端 + Element Plus + Tailwind CSS |

---

## 参考资源

- **用例规范**：`prd/testcase-spec.md` - 所有测试用例的字段规范和格式要求
- **模板参考**：`example/` 目录下的 5 个模板文件
- **QA 知识库**：`doc/QA-HowTo.md`

---

*版本：v2.0*
*最后更新：2026-04-09*
