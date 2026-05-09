# DESIGN.md — FamliyBank 设计系统快照

> 这份文件供 implementer 和 code-reviewer 在 UI 设计/优化类任务时加载。
> **Leader 不维护本文件的 token 数值**——具体颜色/字体/间距值由 implementer 首次执行 UI 任务时通过读代码补全和更新。
> implementer 在每次 UI 任务执行前先核对本文件与代码是否一致，发现漂移就更新本文件。

---

## 如何加载与维护

**implementer 首次加载流程**：

1. Read `app/src/main/java/com/kt/famliybank/ui/theme/Color.kt` → 填充 § Color
2. Read `app/src/main/java/com/kt/famliybank/ui/theme/Type.kt` → 填充 § Typography
3. Read `app/src/main/java/com/kt/famliybank/ui/theme/Theme.kt` → 填充 § Theme
4. Glob `app/src/main/java/com/kt/famliybank/ui/components/**` → 列举到 § Components
5. Grep `padding\(.*\.dp\)` 和 `Spacer` 用法 → 总结到 § Spacing

**后续加载流程**：直接读取本文件即可，除非"快照过期"标记被设置。

**快照过期触发条件**（implementer 主动维护）：
- Color.kt / Type.kt / Theme.kt 任一文件变更后
- 新增了 ui/components/ 下的可复用组件
- 引入了新的 spacing 或 elevation 规则

---

## § Color

> implementer 首次填充：从 `ui/theme/Color.kt` 读取所有 `val xxxColor = Color(...)` 定义，按角色分类。

### Light scheme

```
TBD — implementer 首次执行 UI 任务时从 Color.kt 提取
```

### Dark scheme

```
TBD — implementer 首次执行 UI 任务时从 Color.kt 提取
```

### 使用约束（impeccable 法则的 Compose 翻译）

- 所有颜色通过 `MaterialTheme.colorScheme.xxx` 引用，**禁止**写硬编码 `Color(0xFFxxxxxx)` 在 Composable 里
- 中性色不用纯黑 `Color.Black` / 纯白 `Color.White`，用 `colorScheme.background` / `onBackground`
- 一个屏幕的 color strategy 由方案规划指定（Restrained / Committed / Full palette / Drenched），实施时遵守

---

## § Typography

> implementer 首次填充：从 `ui/theme/Type.kt` 读取所有 `val xxxStyle = TextStyle(...)`。

### Type scale

| 角色 | 用途 | 字号 / 字重 | 行高 |
|---|---|---|---|
| `displayLarge` | TBD | TBD | TBD |
| `headlineMedium` | TBD | TBD | TBD |
| `titleLarge` | TBD | TBD | TBD |
| `bodyLarge` | TBD | TBD | TBD |
| `bodyMedium` | TBD | TBD | TBD |
| `labelLarge` | TBD | TBD | TBD |
| `labelSmall` | TBD | TBD | TBD |

### 使用约束

- 一律走 `MaterialTheme.typography.xxx`，**禁止** `TextStyle(...)` 现写
- 类型层级靠 scale + weight 对比（≥1.25 比例），不靠颜色制造层级
- 数字（金额、余额）默认用 `tabular figures` 字形特性，避免抖动

---

## § Spacing

> implementer 首次填充：grep `\.padding\(.*\.dp\)` / `Spacer.*\.dp` 用法，归纳到 4/8 倍数尺度。

### Spacing scale

| Token | 值 | 用途 |
|---|---|---|
| `xs` | TBD dp | 图标与文字间距、行内分割 |
| `sm` | TBD dp | 紧凑布局元素间距 |
| `md` | TBD dp | 卡片内边距、表单字段间距 |
| `lg` | TBD dp | 板块之间间距 |
| `xl` | TBD dp | 屏幕级 padding |

### 使用约束

- 间距值必须从尺度中选，**禁止**出现 `13.dp` `17.dp` 这种"奇数 dp"
- 卡片内 padding 和卡片间 gap 不要相等——会失去节奏感

---

## § Theme（dark / light 决策）

> implementer 首次填充：从 `Theme.kt` 读 `MaterialTheme(colorScheme = ...)` 的判定逻辑。

- 默认主题：`TBD — 从 Theme.kt 读取`
- 是否支持 dynamic color：`TBD`
- 是否跟随系统：`TBD`

**dark / light 选择原则**（impeccable 法则）：每个 UI 任务的方案规划必须给出"场景句"（谁、在哪、什么光线、什么心情），由场景句决定主题，**不要**默认走任一主题。

---

## § Components

> implementer 首次填充：glob `ui/components/**/*.kt`，列出每个可复用组件 + 一句话用途。

### 已有组件清单

| 文件 | 组件名 | 用途 | 状态完整性 |
|---|---|---|---|
| TBD | TBD | TBD | TBD |

### 状态完整性自查项（impeccable 法则）

每个交互组件必须实现：default / hover（触屏端可省略） / focus / pressed / disabled / loading / error。
缺失任一项的组件在 UI 优化任务中要补齐。

---

## § Motion

### 默认时长与曲线

- **过渡**：150–250 ms（Compose 默认 `tween(200)` 起步）
- **缓动**：用指数缓出族 `EaseOutQuart` / `EaseOutQuint` / `EaseOutExpo`，**禁止** 回弹（`Spring` 配合 `DampingRatioMediumBouncy` 等只在明确需要时用）
- **不要 animate** 布局相关属性（`size`、`padding` 直接动画会触发重排）

### 使用约束

- 动效只用于传达状态变化（出现/消失/反馈/加载），**禁止**装饰性动效
- 编排式入场动画（页面元素一个个跳出来）一律不做，产品 UI 需要"立刻可用"

---

## § 交互模式

### 反射性禁令（impeccable for Compose）

- ❌ 反射性用 `ModalBottomSheet` / `AlertDialog` — 先穷尽 inline 展开方案
- ❌ 卡片左/右色条 `Modifier.border(start/end)` 当强调
- ❌ Brush 渐变填充文字
- ❌ 默认 `BlurEffect` / 半透明白当装饰
- ❌ "大数字 + 小标签 + 渐变背景" 的 Hero Metric 卡片
- ❌ 同尺寸 Icon+Title+Subtitle 卡片网格阵列

### 反馈优先级

- 优先级 1（推荐）：Snackbar with undo（适合"删除"、"修改"等可逆操作）
- 优先级 2：Inline 状态消息（表单字段错误）
- 优先级 3：AlertDialog（仅用于不可逆且高风险操作）

---

## § 维护历史

| 日期 | 维护者 | 变更说明 |
|---|---|---|
| 2026-04-26 | Leader | 文件骨架建立，所有 token 值待 implementer 首次 UI 任务时补全 |
