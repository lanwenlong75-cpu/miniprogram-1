---
name: code-review
description: Use when reviewing code produced by another agent or developer before merging, especially when checking against a written spec or plan
---

# code-review

## 概述
两阶段代码审查方法论。阶段一作为硬性关卡——方案不合规则阻断所有进度。阶段二发现质量问题。核心原则：**独立性 + 基于严重性的关卡控制**。

## 阶段一：方案合规（硬性关卡）

**如果有任何项目失败，停。不要进入阶段二。**

### 1.0 读取 DISPATCH PACK（决定本次审查覆盖哪些维度）

打开 `工作目录/任务分发/{任务名}_方案规划.md`，读取最顶部的 DISPATCH PACK 块。

如果 DISPATCH PACK 缺失或字段不完整 → 立即阻断，要求 Leader 补全。

### 1.1 范围蔓延检查
- Diff 中是否包含任务方案中未列出的文件？
- 是否实现了清单中没有的功能？
- 是否有无关代码的"顺便重构"？

**如果发现**：列出每一个超出范围的变更。要求回滚或明确批准。

### 1.2 范围漂移检查
- `{任务名字}_方案规划.md ` 中的每个清单项目都实现了吗？
- 应该有实现的地方是否有 TODO 或占位符？
- 实现者是否跳过了任何验收标准？

**如果发现**：列出每一个缺失项。退回给实现者。

### 1.3 任务报告验证
- `工作目录/任务执行/` 中是否存在任务报告？
- 报告中的清单是否与方案清单匹配？
- 声称已完成的项目是否实际存在于 diff 中？

**阶段一通过标准**：零范围蔓延且零范围漂移。

---

## 阶段二：质量与安全扫描

### 2.1 编译验证
- 运行 `./gradlew assembleDebug`
- 必须零错误通过，零视为错误的警告
- 任何失败 = 立即阻断，退回给实现者

### 2.2 导入验证（Android 中至关重要）
对于修改文件中使用的每个符号：
- 验证对应的 `import` 存在
- 检查未使用的导入（死代码）
- 验证没有星号导入 (`import androidx.compose.*`)，除非明确允许

**常见陷阱**：`Spring.StiffnessMedium`、`Icons.Default.Add` — 这些需要显式导入。

### 2.3 反馈红线扫描
阅读 `.claude/feedback/` 中**所有**文件：
- 这段代码是否触发了任何已知的"红线"错误模式？
- 示例：UI 变更没有预览更新、Room 实体变更没有迁移、业务逻辑在 Composable 中、缺少错误处理
- 如果违反任何反馈规则，就是阻断项

### 2.4 架构审查

| 检查 | 查找内容 |
|-------|-----------------|
| **状态管理** | 状态在 ViewModel 中，不在 Composable 中。适当使用 `rememberSaveable`。 |
| **线程** | Room 操作使用 `Dispatchers.IO`。不阻塞主线程。UI 作用域工作使用 `viewModelScope`。 |
| **空安全** | 不使用 `!!` 操作符。空值类型用 `?.let` 或 Elvis 操作符处理。`lateinit` 只在真正安全时使用。 |
| **Compose 最佳实践** | Composable 可重启且可跳过。Composable 体中无副作用。关键参数稳定。 |
| **资源管理** | 没有硬编码字符串/尺寸（使用 `strings.xml`、`dimens.xml`）。没有硬编码颜色（使用主题）。 |

### 2.5 安全检查
- 代码中没有敏感数据（令牌、密钥）
- 动态查询中没有 SQL 注入漏洞
- 用户可见字段有适当的输入验证
- 敏感数据没有 `allowBackup=true`，除非是故意的

### 2.6 测试覆盖（如适用）
- 新的业务逻辑路径是否有单元测试覆盖？
- 边界情况（空状态、错误状态）是否处理？
- 现有测试仍然通过：`./gradlew test`

---

## 阶段三：UI 设计审查 · 按 DISPATCH PACK 的 reviewer_checks 严格执行

读方案规划文件最顶部的 DISPATCH PACK 块。

如果 `reviewer_checks.ui_design_check == false`：
  → **跳过整个阶段三，直接进入写审查报告**
  → 不要自行判断"这看起来像 UI 任务"，一切以 DISPATCH PACK 为准

如果 `reviewer_checks.ui_design_check == true`：
  → 加载 `reviewer_checks.ui_design_modules` 列出的所有模块
  → 按下方流程执行

**核心原则**：reviewer 不判断任务类型，只执行 DISPATCH PACK 的指令。

> Leader 不展开"为什么这么审"——具体维度、评分细则、AI Slop 判定标准全在 impeccable 的 reference 文件里，按需加载。

### 3.0 加载 impeccable 审查工具

```
Read .claude/设计文件/PRODUCT.md                                      ← 产品定位 / 反例
Read .claude/设计文件/DESIGN.md                                       ← 当前设计系统快照
Read .claude/skills/impeccable/SKILL.md                              ← 共享设计法则 + 绝对禁令
Read .claude/skills/impeccable/reference/critique.md                 ← UX 设计评审方法论
Read .claude/skills/impeccable/reference/heuristics-scoring.md       ← Nielsen 启发式评分细则
Read .claude/skills/impeccable/reference/cognitive-load.md           ← 认知负荷 8 项 checklist
Read .claude/skills/impeccable/reference/product.md                  ← Product register 法则
```

### 3.1 AI Slop 检测

按 `impeccable/SKILL.md` 中 "Absolute bans" + "AI slop test" 段落核对 diff：

- 是否触发 6 条绝对禁令（DESIGN.md § 交互模式 反射性禁令已列出 Compose 翻译版）？
- **Category-Reflex 自检**：从"家庭记账"这个领域名能不能直接猜出现在的配色和布局？如果能，是 slop，要重做。
- 让一个不知情的人看到这个屏幕，会不会脱口而出"这是 AI 做的"？

### 3.2 Cognitive Load 评分

按 `cognitive-load.md` 的 8 项 checklist 打分：

- 失败 0–1 项 = low（合格）
- 失败 2–3 项 = moderate（建议修但不阻断）
- 失败 4 项及以上 = critical（阻断）

每个决策点的可见选项数：>4 → 必须标注理由或重新组织。

### 3.3 Nielsen 启发式评分

按 `heuristics-scoring.md` 给 10 条启发式各打 0–4 分：

1. 系统状态可见性
2. 系统与现实世界的匹配
3. 用户控制与自由度
4. 一致性与标准
5. 错误预防
6. 识别优于回忆
7. 灵活性与效率
8. 美学与极简设计
9. 帮助用户识别、诊断和恢复错误
10. 帮助和文档

总分 ≤ 25（满分 40）→ 阻断。

### 3.4 设计系统对齐检查

- diff 中所有颜色是否走 `MaterialTheme.colorScheme.xxx`？硬编码 `Color(0xFFxxxxxx)` 一律阻断
- 所有字体是否走 `MaterialTheme.typography.xxx`？现写 `TextStyle(...)` 一律阻断
- 所有间距是否在 DESIGN.md 已定义的尺度内？出现 `13.dp` `17.dp` 这类非尺度值 → 阻断
- 新增的可复用组件是否归位 `ui/components/`？且组件状态是否完整（default/focus/pressed/disabled/loading/error）？

### 3.5 交互流程合理性

按 `critique.md` 中 "Information Architecture & Flow" 维度核对：

- 这个屏幕的"形状"是否和邻近功能一致？（保存方式、错误提示位置、确认弹窗 vs Snackbar 选择）
- 是否触发反射性禁令（默认用 ModalBottomSheet/AlertDialog 而没穷尽 inline 方案）？
- 反馈优先级是否对：可逆操作走 Snackbar undo，不可逆才用 AlertDialog？

---

## 审查报告格式

在 `工作目录/审查/` 下编写 `{任务名}_审查报告.md`：

```markdown
# 审查报告 - [任务名]

**任务类型**：功能开发 | UI 设计-优化 | 混合（先功能后优化）

## 阶段一：方案合规
- 范围蔓延：[无 / 列出项目]
- 范围漂移：[无 / 列出项目]
- 结论：[通过 / 阻断]

## 阶段二：质量扫描
- 编译：[通过 / 失败]
- 导入检查：[通过 / 失败]
- 反馈扫描：[通过 / 发现违规]
- 架构：[备注]
- 安全：[通过 / 问题]

## 阶段三：UI 设计审查（按 DISPATCH PACK 的 ui_design_check 决定，false 时填"N/A — 跳过"）
- AI Slop 检测：[通过 / 触雷项 — 列出]
- Category-Reflex 自检：[通过 / 触雷]
- Cognitive Load 评分：[low / moderate / critical]，失败项数：N/8
- Nielsen 启发式评分：N/40，单项 ≤2 分项目：[列出]
- 设计系统对齐：[通过 / 漂移项 — 列出]
- 交互流程合理性：[通过 / 异常项 — 列出]
- 结论：[通过 / 阻断]

## 阻断项（如有）
1. [严重性] [描述] --> [文件:行号] --> [所需操作]

## 建议（非阻断）
1. [描述]

#### 任务追加
- [任务1]：[简述结果] [变动文件-无需整条路径]
- [任务2]：[简述结果] [变动文件-无需整条路径]
没有就留空
```

---

## 审查者常见错误

| 错误 | 发生原因 | 预防 |
|---------|---------------|------------|
| "能编译，发吧" | 编译是底线，不是天花板 | 始终运行完整阶段二 |
| "代码看起来没问题" | 表面阅读会遗漏逻辑 bug | 追踪变更代码中的数据流 |
| "只是个小变更" | 小变更也会破坏东西 | 无论 diff 大小都应用完整审查 |
| 跳过反馈扫描 | "我不需要读旧反馈" | 反馈存在是因为这个团队以前犯过这个错 |
| 批准自己的工作 | 结构性冲突——你知道意图，不知道风险 | 绝不审查自己写的代码 |

---

## 快速参考

```
代码已交付
       |
       v
读取 DISPATCH PACK（§ 1.0）
       |
       v
阶段一：方案合规
       |
       +-- 失败？ --> 退回（列出确切违规）
       |
       v
阶段二：质量扫描
       |
       +-- 失败？ --> 退回（分类阻断项）
       |
       v
ui_design_check == false？
       |
       +-- 是 --> 跳过阶段三
       |
       +-- 否 --> 阶段三：UI 设计审查
                     |
                     +-- 失败？ --> 退回（设计阻断项）
                     |
                     v
       v
编写审查报告
       |
       v
通过 / 拒绝
```