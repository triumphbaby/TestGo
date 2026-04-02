# 📝 对话问答记录

> 本文档记录与 Claude Code 的对话问答内容，便于后续回顾和参考

---

## 🗓️ 2026-02-10 - Skill 文档优化与拆分

### ❓ Question 1: Skill Specification Review

**Asked by:** Test Engineer
**Time:** 2026-02-10

> I'm a test engineer. Please read skill.md in this folder. From the perspective of the skill.md specification, is the summary and analysis reasonable? If not, how should it be optimized?

### ✅ Answer 1: 规范分析与优化建议

#### 一、Skill 规范层面的问题

**1. Frontmatter 基本合格，但缺少关键指引**

当前的 frontmatter：
```yaml
name: 需求文档转测试用例
description: 把需求转换成xlsx表格格式的测试用例文件
```

**问题**：`description` 过于简略，没有说明输入是什么、触发方式是什么。建议补充用户如何使用这个 skill 的上下文。

**2. 缺少"如何生成 xlsx"的技术指引**

整个 prompt 详细定义了测试用例的**内容规范**，但完全没有告诉 AI：
- 用什么库/工具生成 xlsx（如 Python 的 `openpyxl`、Node 的 `xlsx`/`exceljs`）
- 输出文件命名规则和存放路径
- 表头结构（列顺序、Sheet 命名）
- 用户的需求文档以什么形式输入（文件路径？粘贴文本？URL？）

这会导致 AI 每次执行时自行猜测技术方案，结果不稳定。

**3. Prompt 过长，信噪比不理想**

当前 prompt 约 186 行，包含大量**教学性内容**（如颗粒度理论讲解、优缺点分析、"问自己几个问题"等）。这些内容对**人类学习**有价值，但对 AI 执行任务来说是噪音。Skill prompt 应该是**指令性的**，而非教程性的。

#### 二、内容逻辑层面的问题

**1. 优先级定义与示例自相矛盾**

- **第 3 节**中 P0 示例是细颗粒度的单场景用例（"验证使用正确的用户名和密码可以成功登录系统"）
- **第 4 节规则 1**却说 P0 应为**粗颗粒度**（"验证管理员成功登录并创建存储池"，覆盖端到端流程）

这两处直接矛盾，AI 执行时会无所适从。

**2. P1 示例格式不完整**

第 3 节的 P1 示例（第 73-78 行）中，"预期结果"没有按照规范格式书写，缺少独立的 `预期结果` 标签分隔，和上文定义的格式要求不一致，作为"示例"会误导 AI 输出。

**3. 第 5 节与第 6 节存在大量重复**

"如何进行自我检查"和"用例框架"覆盖的内容高度重叠（兼容性、安全、性能、异常处理等），应合并精简。

**4. 有错别字**

第 5 行："必**现**包含" → 应为"必**须**包含"。

#### 三、优化建议总结

| 维度 | 问题 | 严重程度 |
|------|------|---------|
| 技术可执行性 | 缺少 xlsx 生成的技术方案指引 | **高** |
| 逻辑一致性 | P0 优先级定义与示例矛盾 | **高** |
| 示例质量 | P1 示例格式不规范 | **中** |
| Prompt 效率 | 教学性内容过多，指令密度低 | **中** |
| 内容重复 | 第 5、6 节大量重叠 | **低** |
| 错别字 | "必现" → "必须" | **低** |

**核心原则**：Skill prompt 应该是给 AI 的**执行指令**，不是给人类的**培训教材**。需要做的是：把教学内容转化为明确的规则，补充技术实现指引，消除矛盾，精简篇幅。

---

### ❓ Question 2: Skill Optimization Request

**Asked by:** Test Engineer
**Time:** 2026-02-10

> OK, I got it. Now, please optimize this skill.md. Conform to the norms as much as possible. skill.md can be split if necessary! Because I want to sort out the functional test skill.md for different scenarios.

### ✅ Answer 2: 优化方案与文件拆分

#### 文件结构设计

将原始 `skill.md` 拆分为 **1 个共享规范文档 + 4 个场景化 Skill 文件**：

```
TestGo/
├── testcase-spec.md              ← 共享规范文档（被所有 Skill 引用）
├── skill-functional-test.md      ← 功能测试 Skill
├── skill-compatibility-test.md   ← 兼容性测试 Skill
├── skill-special-test.md         ← 专项测试 Skill（存储异常/安全/性能）
└── skill-upgrade-test.md         ← 升级刷机测试 Skill
```

#### 优化要点

**架构层面：**
- 拆分为 **1 个共享规范 + 4 个场景 Skill**，各 Skill 引用 `testcase-spec.md` 获取公共规则
- 修改规范时只需改一处，所有 Skill 自动同步
- 每个 Skill 职责单一，按测试类型独立调用

**规范层面：**
- 补充了 **xlsx 技术方案**（Python + openpyxl、表头列顺序、样式要求）
- 补充了 **输入输出约定**（文件命名、Sheet 划分、用例编号格式）
- 统一了**优先级与颗粒度的对应关系**（消除了原文 P0 定义与示例的矛盾）

**内容层面：**
- 删除了教学性、解释性内容，全部改为**指令式**写法
- 修复了 P1 示例格式不完整的问题，每个 Skill 都提供了**格式统一的完整示例**
- 合并了原文第 5、6 节的重复内容，精简为自检清单和覆盖清单
- 修正了"必现" → "必须"的错别字

#### 各 Skill 覆盖范围

**1. skill-functional-test.md（功能测试）**
- P0：核心正向场景
- P1：有效/无效等价类、空值、边界值、极值、特殊字符、UI、并发、权限
- P2：数据异常、设备重启

**2. skill-compatibility-test.md（兼容性测试）**
- P1：硬件平台、浏览器、操作系统、终端类型、分辨率、局域网、公网穿透、域名登录
- P2：弱网、断网

**3. skill-special-test.md（专项测试）**
- P2：存储池异常（拔盘、降级、损毁）
- P2：安全测试（XSS、SQL注入、鉴权、数据泄露、CSRF、HTTPS）
- P2：性能与压力（响应速度、大数据量、频繁操作、资源泄漏）

**4. skill-upgrade-test.md（升级刷机测试）**
- P1：数据库脚本变更、OTA升级、新版本刷机初始化

---

### ❓ Question 3: File Organization Request

**Asked by:** Test Engineer
**Time:** 2026-02-10

> 把生成的文件和手动导入的文件分类到不同文件夹，便于后续管理

### ✅ Answer 3: 文件分类整理

#### 最终目录结构

```
TestGo/
├── original/                          ← 手动导入的原始文件
│   └── SKILL.md                       （原始需求转用例规范）
│
└── docs/                              ← AI 生成的优化文件
    ├── testcase-spec.md               （共享规范，被所有 Skill 引用）
    ├── skill-functional-test.md       （功能测试 Skill）
    ├── skill-compatibility-test.md    （兼容性测试 Skill）
    ├── skill-special-test.md          （专项测试 Skill）
    └── skill-upgrade-test.md          （升级刷机测试 Skill）
```

#### 管理建议

- **original/** 文件夹：存放所有手动导入的原始文档，保留原始需求和规范
- **docs/** 文件夹：存放所有 AI 生成和优化后的规范文档
- 后续如有新的手动导入文档放 `original/`
- 新增或迭代的规范文档放 `docs/`
- 引用路径：四个 Skill 文件与 `testcase-spec.md` 同在 `docs/` 目录下，引用时使用"当前目录下的 `testcase-spec.md`"即可

---

## 📌 关键要点总结

### Skill 开发最佳实践

1. **Frontmatter 必须明确**：name + description（含用法说明）
2. **技术方案要具体**：指定使用的库、文件命名规则、输出格式
3. **指令式而非教学式**：删除理论讲解，只保留执行规则
4. **示例要完整且一致**：示例格式必须与规范定义严格一致
5. **避免内容重复**：相同内容提取到共享文档中
6. **模块化设计**：按场景拆分 Skill，便于独立调用和维护

### 文件管理建议

- 原始文档与生成文档分开存放
- 使用共享规范文档避免重复维护
- 清晰的文件夹命名便于快速定位

---

*最后更新：2026-02-11*
