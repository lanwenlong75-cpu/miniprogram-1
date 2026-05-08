---
name: task-dispatcher
description: Use when finishing requirement discussion and about to start a development task, or when distributing work to sub-agents
---

# task-dispatcher

任务分发与调度方法论。定义从需求确认到任务启动的完整流程。

**相关文档**：
- `COMMIT_GUIDE.md` — Git Commit 统一策略
- `REWORK_GUIDE.md` — 返工流程指南
- `MULTI_MODULE_GUIDE.md` — 多模块任务拆分与执行指南（当任务需要拆分时阅读）

---

# 核心原则
1. **用户只在最后审核一次**
   - 子模块开发完成后不中断等待用户确认
   - 全部完成后统一审核

2. **所有子模块在同一个分支上连续开发**
   - 避免多次合并冲突

---
# 工作流程

## 步骤1：环境搭建
**查看当前分支情况**
```bash
git status 
```
**如果存在未提交的修改**：
```bash
git diff              # 查看改了什么
git stash push -m "WIP: 临时保存"   # 暂存到 stash（仅限确定无关的修改）
```
**切回主分支****
```bash
git checkout master        # 或 main
```
**创建功能分支**
```bash
git checkout -b feat/xxx    # 新功能
git checkout -b fix/xxx     # Bug 修复
git checkout -b refactor/xxx # 重构
```
**分支命名规范**：
| 类型 | 前缀 | 示例 |
|------|------|------|
| 功能开发 | `feat/` | `feat/accounting-stats` |
| Bug 修复 | `fix/` | `fix/navigation-crash` |
| 重构 | `refactor/` | `refactor/texture-system` |
| UI 优化 | `feat/ui-` | `feat/ui-card-redesign` |

**验证分支创建成功**
```bash
git branch              # 确认当前分支带 *
git log --oneline -3    # 确认基线正确
```

## 步骤 1 ：派 scout 侦察（写方案规划之前必做）

如果本次任务涉及修改 / 新增代码（纯文档任务可跳过），根据`scout-run`SKILL的内容来派遣socut Agent来完成任务：

## 步骤2：方案规划撰写
1. 对需求进行评估，是否复杂？ 是否需要拆分成一个个子模块完成。
- **不需要拆分** → 编写单份 `{任务名}_方案规划.md`，保存在 `工作目录/任务分发/`然后下一步骤
- **需要拆分** → 接下来的**所有步骤**全部按`MULTI_MODULE_GUIDE.md`来走。
    **拆分判断标准**（以下任意一条命中即拆分）：

    | 维度 | 触发条件 | 示例 |
    |------|---------|------|
    | 规模 | 估算工具调用超过 40 次 | 3+ 页面、5+ 组件、跨多层架构 |
    | 依赖链 | 存在明确先后顺序 | A 建数据层 → B 建 UI 层 |
    | 异构性 | 混杂不同类型工作 | 功能开发 + UI 设计-优化 |
    | 风险隔离 | 某部分改动风险高 | 核心数据模型变更 vs 周边 UI |

    **反模式（不要拆分）**：
    - 只是"改动文件多"但逻辑单一
    - 可以一个 session 内完成的简单任务
    - 为了拆分而拆分

### 方案规划必填：DISPATCH PACK + 四层结构

方案规划文件的最顶部必须有 DISPATCH PACK，下面是四层结构。

#### DISPATCH PACK（文件最顶部）

````markdown
<!-- DISPATCH PACK · Leader 钉死，下游不得自行判断 -->
```yaml
task_type: feature | ui_optimize | hybrid
implementer_resources:
  必加载: [dev-builder]
  条件加载: []  # 如果 task_type 是 ui_optimize / hybrid，这里填 [.claude/设计文件/, impeccable]
reviewer_checks:
  scope_check: true        # 范围合规检查，永远开启
  quality_check: true      # 质量与安全检查，永远开启
  ui_design_check: false   # task_type=feature 时 false；ui_optimize/hybrid 时 true
  ui_design_modules: []    # ui_design_check=true 时填 [impeccable critique, heuristics-scoring, cognitive-load]
constraints:
  - SDK 版本: ...
  - 禁用 API: ...
  - 架构约束: ...
```
<!-- END DISPATCH PACK -->
````

**任务类型语义**（Leader 在 brainstorm 时判断一次，钉死到 DISPATCH PACK 中）：

| 类型 | 关注点 | implementer 加载 | code-reviewer 加载 |
|---|---|---|---|
| `功能开发` | 逻辑正确、Material 3 默认值即可 | 现状不变 | 现状不变 |
| `UI 设计-优化` | 视觉、交互、动效深度打磨 | `.claude/设计文件/` + `.claude/skills/impeccable` | `.claude/skills/impeccable/reference/critique.md` + `.claude/skills/impeccable/reference/heuristics-scoring.md` |
| `混合（先功能后优化）` | 拆两阶段顺序执行 | 阶段 1 按功能开发；阶段 2 按 UI 设计-优化 | 同上分阶段 |

**判定规则**（Leader 在 brainstorm 时使用）：
- 用户提到"新增 X 功能 / 修复 X bug / 加 X 接口" → `功能开发`
- 用户提到"优化 UI / 改样式 / 重新设计 X / 美化 X / 卡片不好看" → `UI 设计-优化`
- 用户提到"做个新页面，希望好看" / "新功能 + 视觉打磨" → `混合（先功能后优化）`

**第一层：契约**
- 验收标准：什么状态算"做完"
- 输入输出定义：输入、输出、影响哪些数据
- 红线约束：不能碰哪些文件、不能用哪些 API

**第二层：任务清单**
- 不可再拆的最小交付单元
- 每个任务有一行可验证的完成标准
- 标明依赖关系

**第三层：任务追加**
- 因为返工，而新增的要优化的需求
- 没有就留空

**第四层：Scout 摘要**

> 直接粘贴 Step 1.5 中 scout 返回的报告原文，Leader 不增不减不改写。
> 让 implementer 在开始工作前已知道关键文件的状态，减少 read 次数。

---

## 步骤2.1 开工前更新项目状态.md
调用`pj-log`SKILL来对`.claude/项目状态.md`文件进行更新。
---
## 步骤3：锁定基准

方案规划编写完成后，立即 commit 保存基准，以便后续熔断时能 reset 回这里。
```bash
git add "工作目录/任务分发/xxx_方案规划.md"
git commit -m "plan: xxx功能方案规划"
```

## 步骤4：代码编写

将任务分发给 implementer 按如下格式：
**Leader Prompt**：
```
任务报告：工作目录/任务分发/{任务名}_方案规划.md
请读取报告并按规划执行。
```

## 步骤5 : 代码审查
implementer完成后，调用code-reviewer进行审查 按照如下格式调用:
**Leader Prompt**：
```
任务报告：工作目录/任务分发/{任务名}_方案规划.md
开发报告：工作目录/任务执行/{任务名}_开发报告.md
请读取报告与规划进行审查。
```

## 步骤6 : 审查闭环
- code-reviewer 没发现问题、或仅发现可自动修复的小问题（导入缺失、命名不规范、格式错误）→ 小问题由 code-reviewer 直接修复 → 进入下一步骤
- code-reviewer 发现需要重新设计的大问题（架构违反、范围漂移、不符合方案规划）→ 退回 implementer 修复，修复完再次审查，直到通过 → 进入下一步骤

## 步骤7：用户审核
- 所有任务完成后、告诉用户，让用户进行审核，此时添加一份固定话术”当前任务以完成，请问是否有任何问题？如果没有，请告诉我，我会合并主干”
- 用户表达了”有”的意图，接下来的所有流程按照`REWORK_GUIDE.md`来走。
- 用户表达了”没有”的意图，则直接合并分支。

## 步骤8 完工后更新项目状态.md
调用`pj-log`SKILL来对`.claude/项目状态.md`文件进行更新。

```bash
./gradlew assembleDebug --quiet   # 编译确认
git checkout master
git merge feat/xxx --no-ff
git branch -d feat/xxx
```
