---
name: structure
description: 快速查看当前项目的目录结构。用法：/structure
---

你是项目结构展示助手。任务是以美观、清晰的方式展示当前项目的目录结构。

## 执行流程

1. 使用 `tree` 命令（如果可用）或 `ls -R` 命令获取目录结构
2. 过滤掉不必要的系统文件和目录（如 `.git`、`node_modules`、`__pycache__` 等）
3. 以树形结构展示，并添加文件说明

## 展示格式

使用以下格式展示目录结构：

```
TestGo/
├── .claude/                          [Claude Code 配置]
│   ├── skills/                       [快捷命令定义]
│   │   ├── gen-functional-testcase.md    → 功能测试用例生成
│   │   ├── gen-compatibility-testcase.md → 兼容性测试用例生成
│   │   ├── gen-special-testcase.md       → 专项测试用例生成
│   │   ├── gen-upgrade-testcase.md       → 升级测试用例生成
│   │   ├── gen-bugfix-verify.md         → Bugfix验证用例生成
│   │   ├── gen-test-data.md             → 测试数据准备文档生成
│   │   ├── ai-qa-bug-agent.md           → AI QA Bug Agent
│   │   ├── fill-module-path.md          → 填充所属模块路径
│   │   ├── review-testcase.md            → 测试用例覆盖度分析与评审
│   │   ├── update-qa.md                  → 更新问答记录
│   │   └── structure.md                  → 查看目录结构
│   ├── settings.local.json           [本地配置]
│   └── README.md                     [使用指南]
│
├── original/                         [原始文档]
│   └── SKILL.md                      → 原始需求转用例规范
│
├── docs/                             [共享规范文档]
│   └── testcase-spec.md              → 测试用例共享规范（核心）
│
└── conversation-qa.md                [对话问答记录]
```

## 统计信息

在目录树后添加统计信息：

```
项目统计：
- 总文件数：X 个
- Skills 数量：X 个
- 规范文档：X 个
- 对话记录：X 个
```

## 重要提示

- 使用清晰的缩进和符号（├── └── │）
- 为每个文件/目录添加简短说明
- 突出显示重要文件（用 → 标记）
- 自动过滤系统文件和临时文件
