# TestGo

基于 Claude Code 的 NAS 产品测试自动化平台，提供从 PRD 到测试报告的全流程 QA 能力。

## 特性

- **全流程 QA 管线**：一条命令驱动 策略 → 用例 → 执行 → 分析 → 报告 五阶段闭环
- **19 个 Skill 命令**：覆盖功能/兼容性/专项/升级测试用例生成、评审、执行、Bug 管理、报告
- **PRD 反哺**：8 维度扫描需求文档遗漏（状态机路径/异常场景/边界条件/权限组合/平台差异/并发/数据完整性/降级兜底）
- **Figma 集成**：设计稿自动提取 UI 规格，用例预期结果引用精确视觉参数
- **多平台支持**：`--platform pc|mobile` 自动适配兼容性范围和文件命名
- **Python + openpyxl**：用例输出为标准 xlsx，符合企业测试管理规范

## 前置条件

- [Claude Code](https://claude.ai/claude-code) CLI
- Python 3.x + openpyxl
- Node.js + Playwright（自动化执行时需要）

## 快速开始

```bash
# 克隆项目
git clone https://github.com/triumphbaby/TestGo.git
cd TestGo

# 在 Claude Code 中运行全流程 QA 管线
/全流程QA管线 prd/xxx.md --platform pc --no-testsprite

# 或单独使用某个环节
/测试策略生成 prd/xxx.md
/功能测试用例 prd/xxx.md
/测试用例评审 testcase/xxx.xlsx
```

## 全流程 QA 管线

```
Phase 0（可选）  Phase 1         Phase 2         Phase 3      Phase 4        Phase 5
Figma分析    →  策略+PRD反哺  →  用例设计+评审  →  测试执行  →  分析优化    →  报告
  |               |                |               |             |              |
UI Spec        Strategy.md     gen_testcases.py  Execution.md  Bug分类       Report.md
               Supplements.md  Functional.xlsx                 用例修正      BugReport.md
```

每个阶段暂停等用户确认后才继续下一阶段。

## Skills 命令一览

### 核心编排

| 命令 | 说明 |
|------|------|
| `/全流程QA管线` | 5 阶段全流程编排，支持 `--platform`、`--figma`、`--no-testsprite` 等参数 |

### 用例生成

| 命令 | 说明 |
|------|------|
| `/功能测试用例` | 需求 → 功能测试用例 xlsx（P0 核心流程 / P1 等价类+边界值 / P2 异常容错） |
| `/兼容性测试用例` | 需求 → 兼容性测试用例 xlsx（浏览器、OS、分辨率、网络环境） |
| `/专项测试用例` | 需求 → 专项测试用例 xlsx（存储异常、安全、性能压力） |
| `/升级刷机测试用例` | 需求 → 升级刷机测试用例 xlsx（DB 脚本、OTA、刷机初始化） |
| `/Bugfix验证用例` | Bug 修复 → 三层验证用例（根因 / 症状 / 回归） |

### 策略与评审

| 命令 | 说明 |
|------|------|
| `/测试策略生成` | 根据 PRD 生成 8 章策略文档（风险分析、测试范围、深度广度等） |
| `/Figma设计稿分析` | 从 Figma 设计稿提取 UI 规格，生成结构化 UI Spec |
| `/测试用例评审` | 5 维度评审（需求覆盖率、规范性、场景完备性、NFR、UI/交互） |

### 执行与分析

| 命令 | 说明 |
|------|------|
| `/测试执行` | 推送到 TestSprite 执行，失败时降级到本地 Playwright |
| `/用例分析与优化` | 区分用例问题和产品 Bug，自动优化用例 |
| `/记录Bug` | 记录 Bug 并自动创建 Jira 单 |
| `/AI QA Bug Agent` | 分析截图/日志，生成结构化 Bug 报告 |

### 报告生成

| 命令 | 说明 |
|------|------|
| `/缺陷统计报告` | 汇总所有轮次缺陷，生成统计分析报告 |
| `/测试报告` | 基于执行记录和缺陷报告，生成完整 9 章测试报告 |

### 辅助工具

| 命令 | 说明 |
|------|------|
| `/测试数据准备` | 根据用例生成配套测试数据文档 |
| `/填充所属模块` | 批量填充 xlsx 中的所属模块路径 |
| `/structure` | 树形展示项目目录结构 |
| `/更新问答记录` | 将对话问答追加到记录文件 |

## 项目结构

```
TestGo/
├── .claude/
│   └── skills/              ← 19 个 Skill 命令定义 + testcase-spec.md 用例规范
│
│
├── example/                 ← 模板参考
│   ├── TestStrategy.md
│   ├── TestCase.md
│   ├── TestExecution.md
│   ├── BugReporting.md
│   └── TestReport.md
│



## License

Private - Internal use only.
