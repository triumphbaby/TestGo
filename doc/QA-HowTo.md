# How-To QA Log

> 记录与 Claude Code 对话中主动发起的 how-to 类型问答，方便复盘。

## 格式说明

每条记录包含：
- **日期**：对话发生日期
- **Q**：我提出的问题（原文或摘要）
- **A**：Claude 给出的关键结论 / 做法
- **标签**：便于检索的分类标签

---

## 记录

### 2026-04-08 | 如何带 Figma 链接执行管线
**标签**：`pipeline` `figma` `skill用法`
**Q**：如何带上 Figma 链接并正确描述才能让管线规范执行？
**A**：
- 三种方式：`--figma-dir 本地目录`（最可靠）、`--figma Figma链接`（需 token）、两者可与 `--platform` 组合
- 本地目录至少需要 `figma_node.json` + 1 张 PNG；有 `figma_deep.json` 可提取精确颜色/字体，否则降级推断
- Figma 链接模式会自动拉取 API 数据保存到 PRD 同级 `figma/` 目录
- 带 Figma 后管线多出：Phase 0 设计稿分析、Phase 1 维度 9 UI 一致性、Phase 2 用例引用具体 HEX/文案、Phase 4 视觉偏差分类
- 调用时一句话即可：`/全流程QA管线 prd/xxx.md --figma-dir path/to/figma/`，不需要额外描述

<!-- 模板：复制下方块新增条目
### YYYY-MM-DD | 简短标题
**标签**：`skill` `pipeline` `playwright` ...
**Q**：问题内容
**A**：
- 要点 1
- 要点 2
-->
