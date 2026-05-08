# Harness 使用说明

## 这是啥

你的项目现在搭载了 Harness 多 Agent 协作框架。简单说：你告诉 AI 要做什么，它会自动走完需求沟通→方案规划→编码→审查→合并的完整流程。

## 怎么用

**打开新的 Claude Code 会话**，直接说你的需求，比如：

```
帮我添加一个用户登录页面
```

Leader AI 会自动：
1. 跟你沟通确认需求
2. 派 scout 侦察相关代码
3. 写方案规划
4. 派 implementer 编码
5. 派 code-reviewer 审查
6. 让你审核最终结果
7. 合并到主分支

**你自己不需要知道内部流程**，Leader 会引导你。

## 生成的文件在哪儿

| 目录 | 内容 |
|------|------|
| `.claude/CLAUDE.md` | Leader 工作规则 |
| `.claude/agents/` | 3 个 AI 角色定义（scout/implementer/code-reviewer） |
| `.claude/context/` | 项目背景与技术栈文档 |
| `.claude/skills/` | 工作流方法论 |
| `.claude/hooks/` | 自动化脚本（SessionStart 注入上下文等） |
| `工作目录/任务分发/` | 方案规划文档 |
| `工作目录/任务执行/` | 开发报告 |
| `工作目录/审查/` | 审查报告 |

---

# 设计系统（DESIGN.md + PRODUCT.md）

如果你的项目有 UI 界面并启用了设计审查，还需要配置设计系统文件。

## PRODUCT.md（产品定位）
定义了产品的用户画像、品牌调性、绝对不能像什么风格。

## DESIGN.md（设计系统快照）
定义了颜色、字体、间距、组件规范。UI 审查时会用它来检查代码是否符合设计系统。

## 如何填写

在 Claude Code 中直接发送以下话术即可：

```
请使用 impeccable skill 来帮我获取 PRODUCT 和 DESIGN 文档，并存放到设计文件目录中
```

AI 会自动：
1. 对话式了解你的产品定位 → 生成 PRODUCT.md
2. 从代码中提取设计系统（颜色/字体/间距）→ 生成 DESIGN.md
3. 存入 `.claude/设计文件/` 目录

也可以分步运行：
```
/impeccable:teach       → 交互式产品发现，自动写 PRODUCT.md
/impeccable:document    → 从代码提取设计系统，自动写 DESIGN.md
```

---

# 常见问题

**Q: 换了一台电脑，session 不记得之前做了什么怎么办？**
A: Harness 的 SessionStart hook 会自动注入项目状态和上下文。打开新 session 就能看到"项目状态.md"的内容。

**Q: 多人协作怎么用？**
A: 如果安装时选了多人模式，代码写完会推到 Git 仓库并提示你创建 PR，协作者 review 后合并。

**Q: 不想要某个功能怎么办？**
A: 直接改 `.claude/CLAUDE.md` 和对应的 skill 文件即可。Harness 没有"黑盒"——所有规则都是可读可改的 Markdown 文件。

**Q: 怎么更新 Harness？**
A: 重新运行 `/harness-install`，它会覆盖 `.claude/` 下的配置。工作目录（方案/报告/反馈）不会被覆盖。

**Q: 某个 skill 的规则不适合我的项目？**
A: 打开 `.claude/skills/<skill名>/SKILL.md` 直接改。每个 skill 都是纯 Markdown 文件。
