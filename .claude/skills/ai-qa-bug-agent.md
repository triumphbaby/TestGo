---
name: AI QA Bug Agent
description: 自动分析用户问题、截图、日志，生成结构化Bug报告。用法：/AI QA Bug Agent <问题描述/截图/日志>
---

# Skill: ai_qa_bug_agent

version: 3.0 | category: QA Automation | type: agent

AI QA Bug Agent 是一个自动化 QA Agent，可以：

1. 自动分析用户问题
2. 自动分析 DevTools 数据
3. 自动分析截图
4. 自动解析 Console / Network 错误
5. 自动生成 Bug
6. 自动分析 Root Cause
7. 自动生成 Playwright 复现脚本
8. 自动创建 Jira
9. 自动通知研发

适用于：QA 自动提Bug、用户反馈自动转Bug、AI自动发现问题

---

## 触发条件

当用户输入包含以下关键词时触发：bug、错误、报错、异常、crash、error、无法、失败

或者用户上传：截图、日志、视频

## 支持输入类型

text、image、console_log、network_log、devtools_export、video

---

## Agent 工作流程

Step1 Bug信息解析 → Step2 Screenshot OCR分析 → Step3 Console Log分析 → Step4 Network Request分析 → Step5 Bug模块识别 → Step6 Root Cause分析 → Step7 Bug严重等级判断 → Step8 Bug影响范围分析 → Step9 负责人识别 → Step10 重复Bug检测 → Step11 生成Bug报告 → Step12 创建Jira → Step13 发送通知

---

### Step1: Bug信息解析

解析用户输入，提取字段：title、feature、bug_description、environment、steps、expected_result、actual_result、attachments

如果信息缺失，Agent需要自动补全。

### Step2: Screenshot OCR

如果用户提供截图，执行：OCR提取文本、UI模块识别、错误信息识别

示例：截图内容 `TypeError: Cannot read property 'data'` → Agent判断：Frontend JS Error

### Step3: Console Log分析

分析以下错误：TypeError、ReferenceError、Unhandled Promise、SyntaxError

规则：如果是 JS Error → 问题类型：Frontend Bug

### Step4: Network Request分析

分析 HTTP Status 错误类型：500、502、503、504 → 判断：Backend Bug

### Step5: Bug模块识别

根据关键词分类：

| 模块 | 关键词 |
|------|--------|
| AI | AI、语义、embedding、analysis |
| Photos | 图片、照片、thumbnail、预览 |
| Search | 搜索、search |
| Auth | 登录、login、token |
| Storage | 上传、upload、file |

### Step6: Root Cause分析

Agent需要输出Bug根因分析。示例：搜索模块 Tab 映射逻辑错误，导致跳转到关键词Tab而非语义Tab

### Step7: Bug严重程度判断

| 等级 | 定义 |
|------|------|
| Critical | 系统不可用、登录失败、数据丢失 |
| High | 核心功能不可用 |
| Medium | 功能异常 |
| Low | 体验问题 |

### Step8: Priority映射

Critical → P0 | High → P1 | Medium → P2 | Low → P2

### Step9: 负责人识别

| 类型 | 特征 | 负责人 |
|------|------|--------|
| Frontend | UI问题、JS错误、页面跳转 | longhui.chen |
| Backend | 接口错误、数据错误、AI结果错误 | mingzhen.zhu |

### Step10: 重复Bug检测

检测规则：标题相似度、错误日志相似度、模块一致。相似度 > 85% → 标记为疑似重复Bug，返回已有Bug ID

---

## Bug输出模板

```
标题：
模块：
环境信息：
前置条件：
重现步骤：
预期结果：
实际结果：
Root Cause：
严重程度：
优先级：
负责人：
影响端：
影响版本：
修复版本：
复现概率：
附件：
```

## Jira Payload

```json
{
  "fields": {
    "project": { "key": "AI" },
    "summary": "Bug标题",
    "issuetype": { "name": "Bug" },
    "description": "Bug描述",
    "assignee": { "name": "负责人" },
    "priority": { "name": "P1" }
  }
}
```

## QA分析报告

Agent输出内容：Bug Summary、Root Cause、Impact、Reproduction、Fix Suggestion

## 自动通知

支持：Feishu、Slack、Email

通知内容：新Bug已创建 — 标题、严重等级、经办人、Jira链接

## Agent Rules

- 所有Bug结构化
- 必须生成复现步骤
- 必须生成Root Cause
- 必须生成Jira Payload
- 必须检测重复Bug
