# DESIGN.md — 「有什么做什么」设计系统

> 这份文件供 implementer 和 code-reviewer 在 UI 设计/优化类任务时加载。
> **Leader 不维护本文件的 token 数值**——具体颜色/字体/间距值由 implementer 首次执行 UI 任务时通过读代码补全和更新。
> implementer 在每次 UI 任务执行前先核对本文件与代码是否一致，发现漂移就更新本文件。

---

## 如何加载与维护

**implementer 首次加载流程**：

1. Read `miniprogram/app.wxss` → 提取 CSS 变量、填充 § Color 和 § Typography
2. Glob `miniprogram/components/**/*.wxss` → 提取组件样式变量
3. Read `miniprogram/pages/index/index.wxss` `pages/search/search.wxss` `pages/detail/detail.wxss` → 确认页面级样式
4. Glob `miniprogram/components/**` → 列举到 § Components
5. Grep `padding` / `margin` 值 → 归纳到 § Spacing

**后续加载流程**：直接读取本文件即可，除非"快照过期"标记被设置。

**快照过期触发条件**（implementer 主动维护）：
- app.wxss 中的 CSS 变量变更后
- 新增了 components/ 下的可复用组件
- 引入了新的 spacing 规则或断点
- 页面级样式大幅调整

---

## § Color

> implementer 首次填充：从 `miniprogram/app.wxss` 读取 `--color-*` 变量定义，按角色分类。

### 色彩策略：Committed

暖橙色系作为产品身份色，承载 30-60% 的表面面积。不是 Restrained（一抹点缀太冷），也不是 Drenched（全屏橙色会焦虑）。Committed：底色是暖白/米白，主色大面积使用于按钮、标签选中态、匹配度标识。

### Light scheme（默认且唯一，MVP 不做 Dark）

| 角色 | 色值指引 | 用途 |
|------|----------|------|
| `--color-primary` | 暖橙 #F57C3A 附近 | 主按钮、标签选中、强调元素 |
| `--color-primary-light` | 浅暖橙（主色 + 提高 L 降低 C） | 标签未选中背景、卡片底色 |
| `--color-bg` | 暖白 #FFF9F3 附近（向橙色 tint 0.01） | 页面背景 |
| `--color-surface` | 暖白 #FFFEFB 附近 | 卡片、列表项背景 |
| `--color-text-primary` | 深棕灰 #3D2E1F 附近 | 标题、正文 |
| `--color-text-secondary` | 中暖灰 | 辅助文字、食材用量 |
| `--color-text-hint` | 浅暖灰 | 占位符、缺食材灰色态 |
| `--color-success` | 绿色（暖调绿，非翠绿） | 匹配度 100% 标识 |
| `--color-warning` | 暖黄 | 缺 1-2 样食材提示 |
| `--color-border` | 暖调浅灰 | 分割线、卡片边框 |
| `--color-shadow` | 暖棕半透明 | 卡片阴影（rgba 暖色系） |

### 使用约束（impeccable 法则的 WXSS 翻译）

- 所有颜色通过 `var(--color-xxx)` 引用，**禁止**写硬编码色值在页面/组件 WXSS 里
- 背景不用纯白 `#fff`，必须用暖白底色
- 文字不用纯黑 `#000`，用深棕灰
- 红色系不做错误态以外的事——缺食材用暖黄，不用红色

---

## § Typography

> implementer 首次填充：从 `miniprogram/app.wxss` 和页面 WXSS 读取实际使用的字号。

### Type scale（WXSS · rpx）

| 角色 | 用途 | 字号 (rpx) | 字重 | 说明 |
|------|------|------------|------|------|
| `page-title` | 页面大标题 | 36-40 | 700 | 首页"有什么做什么"、详情页菜名 |
| `section-title` | 分区标题 | 30-32 | 600 | "已选食材"、"搜索结果" |
| `card-title` | 菜谱卡片名 | 28-30 | 600 | 结果列表中的菜名 |
| `body` | 正文/步骤文字 | 28 | 400 | 详情页步骤、食材清单 |
| `body-small` | 辅助信息 | 24 | 400 | 匹配度文字、食材用量、烹饪时间 |
| `caption` | 标签/提示 | 22-24 | 400 | 食材标签文字、缺食材提示 |

### 字体族

```css
/* 微信小程序默认栈 */
font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
             "Helvetica Neue", "Microsoft YaHei", sans-serif;
```

### 使用约束

- 层级靠字号 + 字重对比（相邻层级 ≥ 1.2 比例），不靠颜色制造层级
- 菜谱名称统一用 `card-title`，不各自调字号
- 数字（匹配度百分比）默认对齐，避免抖动

---

## § Spacing

> implementer 首次填充：grep `padding` / `margin` 值，归纳到 8rpx 倍数尺度。

### Spacing scale（rpx）

| Token | 值 (rpx) | 用途 |
|-------|----------|------|
| `xs` | 8 | 图标与文字间距、标签内 padding |
| `sm` | 16 | 标签之间 gap、紧凑元素间距 |
| `md` | 24 | 卡片内边距、表单字段间距 |
| `lg` | 32 | 板块之间间距、页面左右 padding |
| `xl` | 48 | 页面顶部/底部留白 |

### 使用约束

- 间距值必须从 8rpx 倍数尺度中选，**禁止**出现 `19rpx` `27rpx` 这种零碎值
- 卡片内 padding 和卡片间 gap 不相等——保持节奏差
- 页面左右 padding 统一为 `lg`（32rpx），不各自定义

---

## § Theme（light only）

**场景句**（impeccable 法则）：
> 下班后的厨房，暖色顶灯下，单手拿着手机站在灶台边。周围是暖白瓷砖、木色橱柜。用户想快速扫一眼，不是沉浸阅读。

- **默认主题**：Light（唯一主题，MVP 不做 Dark）
- **Dark mode**：不做。厨房场景光线充足，dark mode 在灶台边反而看不清
- **背景**：暖白色（`--color-bg`），不是冷白

---

## § Components

> implementer 首次填充：glob `miniprogram/components/**`，列出每个可复用组件 + 一句话用途。

### 已有组件清单

| 目录 | 组件名 | 用途 | 状态完整性 |
|------|--------|------|------------|
| TBD | TBD | TBD | TBD |

### 预期组件（从 PRD 页面推导）

| 组件 | 所属页面 | 用途 |
|------|----------|------|
| `food-tag` | 首页 | 食材标签：选中/未选中态、高亮动效 |
| `food-input` | 首页 | 自定义食材输入 + 自动补全 |
| `recipe-card` | 搜索结果 | 菜谱卡片：封面、菜名、食材、匹配度、缺食材提示 |
| `match-badge` | 搜索结果 / 详情 | 匹配度标识 |
| `empty-state` | 搜索结果 | 未找到结果时的友好提示 |
| `external-link` | 详情 | 外链跳转按钮 |

### 状态完整性自查项（impeccable 法则）

每个交互组件必须实现：default / pressed / disabled / loading。
- `food-tag`：default / selected / disabled
- `recipe-card`：default / pressed（点击反馈）
- 按钮类：default / pressed / loading / disabled

---

## § Motion

### 默认时长与曲线

- **过渡**：150–200ms（小程序 `wx.createAnimation` 或用 CSS `transition`）
- **缓动**：`ease-out`（对应 CSS `cubic-bezier(0.25, 0.1, 0.25, 1.0)`），不做回弹
- **不动画** layout 属性（width/height/padding/margin），只动画 opacity 和 transform

### 使用约束

- 动效只用于传达状态变化（标签选中切换、卡片出现），**禁止**装饰性动效
- 编排式入场动画（页面元素一个个蹦出来）一律不做——产品 UI 要"立刻可用"
- 食材标签选中态可以用 scale + color 过渡（~150ms），但不能跳

---

## § 交互模式

### 反射性禁令（impeccable for WXSS / 微信小程序）

- 禁止卡片侧边彩色竖线（`border-left` / `border-right` > 1px）当强调
- 禁止渐变填充文字（微信小程序的 `background-clip: text` 支持有限，且本身是装饰）
- 禁止玻璃拟态/半透明模糊当默认卡片风格
- 禁止"大数字 + 小标签 + 渐变背景"的 Hero Metric 卡片
- 禁止同尺寸 Icon+Title+Subtitle 卡片网格阵列
- 禁止 wx.showModal 当第一反应——先考虑页面内 inline 提示

### 反馈优先级

- 优先级 1（推荐）：wx.showToast（适合"已复制"、"搜索完成"等瞬时反馈）
- 优先级 2：Inline 状态消息（食材标签区在搜索后滚动到结果区）
- 优先级 3：wx.showModal（仅用于"确认清空已选食材"等不可逆操作）

---

## § 页面视觉纲领

### 首页（pages/index/index）

- **上方**：产品名 + 简洁 slogan（一行）
- **中部主区**：高频食材标签云，3-4 列自动换行。选中态：暖橙填充 + 白色文字；未选中态：浅暖橙背景 + 深棕灰文字
- **下部**：已选食材横排展示（可点击取消），底部固定"查找菜谱"大按钮（主色填充，全宽-左右 lg）
- **空态**：标签自然展示即可，无需特殊空态

### 搜索结果（pages/search/search）

- **顶部**：搜索状态栏（"共找到 N 道菜" + 返回按钮）
- **中部**：菜谱卡片瀑布流。100% 匹配卡片顶部有暖绿色"全匹配"标识；缺食材卡片标注"缺：葱、姜"
- **空态**："没找到能做的菜——试试减少一样食材？" + 返回按钮

### 菜谱详情（pages/detail/detail）

- **顶部**：封面大图（image mode="aspectFill"，高度约 400rpx）
- **中部**：菜名（page-title）+ 烹饪时间/难度（body-small）
- **食材清单**：已有食材绿勾 + 缺少食材灰圈（不用红叉）
- **步骤**：编号列表，body 字号，行高 1.6-1.8 保证易读
- **底部**：外链跳转按钮（小红书/抖音，主色描边 + 暖橙填充各一）

---

## § 维护历史

| 日期 | 维护者 | 变更说明 |
|------|--------|----------|
| 2026-05-09 | Leader | 从 FamilyBank 模板改写为"有什么做什么"设计系统。颜色/字体/组件均为框架值，待 implementer 首次 UI 任务时从实际代码补全 |
