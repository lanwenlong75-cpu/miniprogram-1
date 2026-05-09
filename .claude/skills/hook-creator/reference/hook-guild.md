# Claude Code Hooks 详细配置指南

本指南为 Claude Code 钩子（Hooks）系统的全量配置参考。Hooks 允许在 AI 代理的生命周期中插入确定性逻辑，用于安全审计、自动化任务或上下文增强。

---

## 1. 配置层级与优先级

Claude 按优先级由高到低的顺序合并配置，高优先级覆盖低优先级的同名设置。

| 优先级 | 层级 | 路径/来源 | 描述 |
| :---: | --- | --- | --- |
| 1 | 托管策略 | `managed-settings.json` | 企业管理员部署，不可被用户覆盖 |
| 1a| 托管策略片段 | `managed-settings.d/*.json` | 按字母顺序合并，数组连接去重，对象深度合并 |
| 2 | CLI 标志 | 命令行参数（如 `--settings`） | 启动会话时的临时覆盖 |
| 3 | 本地项目覆盖 | `.claude/settings.local.json` | 针对当前项目的个人偏好，通常被 git 忽略 |
| 4 | 共享项目配置 | `.claude/settings.json` | 团队通用的项目规范，提交至版本控制 |
| 5 | 全局用户配置 | `~/.claude/settings.json` | 跨项目的个人通用设置 |
| — | Skill / Agent 作用域 | Skill 或 Agent 的 frontmatter | 仅限该组件生效，支持 `once` 字段 |

### 托管策略合并逻辑（managed-settings.d/）

系统加载托管策略时遵循以下规则：
1. 首先加载基础的 `managed-settings.json`。
2. 随后按**字母顺序**遍历 `managed-settings.d/` 目录下所有 `.json` 文件。
3. 合并策略：
   - **标量值**（数字/字符串）：后加载的文件覆盖前者。
   - **数组**：连接后去重。
   - **对象**：递归深度合并。

---

## 2. 处理器类型与字段详解

`hooks` 数组中的每个处理器必须指定 `type`。

### A. 命令处理器 (`type: "command"`)

执行本地 Shell 脚本或命令。

| 字段 | 必填 | 说明 |
| --- | :---: | --- |
| `command` | 是 | 运行的命令字符串，支持环境变量如 `$CLAUDE_PROJECT_DIR` |
| `async` | 否 | 布尔值。`true` 时在后台运行，不阻塞会话 |
| `asyncRewake` | 否 | `true` 且命令以退出码 `2` 结束时，主动唤醒 Claude 并显示提示 |
| `shell` | 否 | 可选 `"bash"` 或 `"powershell"` |
| `timeout` | 否 | 超时秒数。`command` 默认 `600`，`prompt` 默认 `30`，`agent` 默认 `60` |

### B. HTTP 处理器 (`type: "http"`)

向 Web 端点发送 POST 请求。**注意**：使用 HTTP 处理器前，必须先在顶层配置 `allowedHttpHookUrls` 白名单，否则请求会被拦截。

| 字段 | 必填 | 说明 |
| --- | :---: | --- |
| `url` | 是 | 必须在 `allowedHttpHookUrls` 白名单内 |
| `headers` | 否 | 键值对对象，支持变量插值 |
| `allowedEnvVars` | 否 | 允许在 headers 中引用的环境变量白名单 |

### C. MCP 工具处理器 (`type: "mcp_tool"`)

调用已连接的 MCP 服务器工具。

| 字段 | 必填 | 说明 |
| --- | :---: | --- |
| `server` | 是 | MCP 服务器名 |
| `tool` | 是 | 工具名 |
| `input` | 否 | 参数对象，支持引用 `${tool_input.field}` |

### D. 提示词处理器 (`type: "prompt"`)

使用 LLM 进行单回合逻辑判定。

| 字段 | 必填 | 说明 |
| --- | :---: | --- |
| `prompt` | 是 | 判定指令（如"检查命令是否安全"） |

### E. 代理处理器 (`type: "agent"`)

（实验性）派生子代理进行多回合验证。

---

### 通用字段（所有处理器类型均可使用）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | :---: | --- |
| `timeout` | number | 否 | 超时秒数。`command` 默认 `600`，`prompt` 默认 `30`，`agent` 默认 `60` |
| `statusMessage` | string | 否 | 自定义钩子运行时终端 UI 显示的加载器文本 |
| `once` | boolean | 否 | **仅在 Skill / Agent frontmatter 中有效**。设为 `true` 则该钩子在当前 session 中仅执行一次后自动移除 |

---

## 3. 匹配器与过滤逻辑

### `matcher`

- 字符串/正则表达式
- 对工具类事件匹配工具名（如 `"Bash"`、`"Edit\|Write"`）
- 对 `FileChanged` 匹配文件名（如 `".env\|.env.local"`）

不同事件支持的 `matcher` 取值：

| 事件 | matcher 过滤目标 | 示例 |
| --- | --- | --- |
| `PreToolUse` / `PostToolUse` / `PostToolUseFailure` | 工具名 | `"Bash"`、`"Edit\|Write"` |
| `SessionStart` | 启动原因 | `"startup"`、`"resume"`、`"clear"` |
| `Notification` | 通知类型 | `"permission_prompt"`、`"idle_prompt"` |
| `ConfigChange` | 配置来源 | `"user_settings"`、`"project_settings"`、`"skills"` |
| `FileChanged` | 文件名 | `".envrc"`、`"package.json"` |

> **注意**：`UserPromptSubmit`、`PostToolBatch`、`Stop`、`CwdChanged` 等事件**不支持** `matcher`，触发时始终执行。

### `if`

（v2.1.85+）使用权限规则语法进行静态预检。

示例：`"if": "Bash(rm *)"` 仅在命令以 `rm` 开头时触发处理器。

### `statusMessage`

执行时在终端显示的自定义旋转加载器文本。

### `once`

（仅 skill/agent frontmatter 中有效）布尔值。`true` 则该 hook 在当前 session 中仅执行一次，随后自动移除。

---

## 4. 全量生命周期事件

| 事件 | 触发时机 | 可否阻塞（Exit 2） |
| --- | --- | :---: |
| `SessionStart` | 会话开始 / 重启 / 清除时 | 否 |
| `UserPromptSubmit` | 用户发送消息，Claude 处理前 | 是 |
| `UserPromptExpansion` | 斜杠命令展开时 | 是 |
| `PreToolUse` | 任何工具执行前 | 是 |
| `PermissionRequest` | 系统准备弹出权限确认框时 | 是 |
| `PermissionDenied` | 工具调用被分类器或规则拒绝时 | 否 |
| `PostToolUse` | 工具执行成功后 | 否 |
| `PostToolUseFailure` | 工具执行出错时 | 否 |
| `PostToolBatch` | 一组并行工具执行完毕后 | 否 |
| `Stop` | Claude 响应结束，交还控制权前 | 是 |
| `StopFailure` | 会话因 API 错误中断时 | 否 |
| `PreCompact` | 触发自动总结前 | 否 |
| `PostCompact` | 总结完成后 | 否 |
| `FileChanged` | 被监听的文件在外部被修改时 | 否 |
| `CwdChanged` | 工作目录切换后（`cd`） | 否 |
| `InstructionsLoaded` | `CLAUDE.md` 或规则文件加载时 | 否 |
| `Notification` | 产生状态通知（如等待输入）时 | 否 |
| `ConfigChange` | 配置文件在会话期间被修改时 | 否 |
| `SubagentStart` | 子代理被派生时 | 否 |
| `SubagentStop` | 子代理执行完毕时 | 否 |
| `TaskCreated` | 任务被创建时 | 否 |
| `TaskCompleted` | 任务执行完成时 | 否 |
| `TeammateIdle` | Agent 团队成员即将进入空闲状态时 | 否 |
| `WorktreeCreate` | Git worktree 被创建时 | 否 |
| `WorktreeRemove` | Git worktree 被移除时 | 否 |
| `Elicitation` | MCP 服务器请求用户输入（如 OAuth、二次确认）时 | 是 |
| `ElicitationResult` | 用户完成 MCP 输入请求并返回结果时 | 否 |
| `Setup` | 执行 `/setup` 命令进行项目初始化时 | 否 |
| `SessionEnd` | 会话结束或进程退出时 | 否 |

---

## 5. 数据交换协议（JSON I/O）

### 输入（stdin / POST Payload）

处理器通过 **stdin**（`command` 类型）或 **POST Payload**（`http` 类型）接收以下 JSON 字段：

| 字段 | 说明 |
| --- | --- |
| `session_id` | 当前会话唯一标识 |
| `hook_event_name` | 触发当前 hook 的事件名称（如 `"PreToolUse"`） |
| `cwd` | 当前工作目录 |
| `tool_name` | 触发事件的工具名（如 `"Bash"`、`"Edit"`） |
| `tool_input` | 工具的输入参数对象 |

> **注意**：`command` 类型的脚本需从 stdin 读取上述 JSON；`http` 类型则以 POST body 形式发送。

### 事件特定输入字段

不同事件会携带额外的专有字段：

| 事件 | 特定字段 | 说明 |
| --- | --- | --- |
| `SessionStart` | `is_resumed` | 布尔值。`true` 表示会话恢复，`false` 表示全新开始 |
| `UserPromptExpansion` | `original_prompt`, `expanded_prompt` | 斜杠命令展开前后的文本 |
| `PreCompact` | `trigger`, `custom_instructions` | `trigger` 为 `"manual"` 或 `"auto"`；`custom_instructions` 为用户自定义的总结指令 |
| `PostCompact` | `before_tokens`, `after_tokens` | 总结前后的 token 数量统计 |
| `PostToolUse` | `tool_response` | 工具执行返回的原始结果 |
| `PostToolUseFailure` | `tool_response` | 工具执行失败的错误信息 |

### 输出（stdout / 2xx Response）

处理器返回的 JSON 核心字段：

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "allow | deny | ask",
    "permissionDecisionReason": "拦截说明",
    "updatedInput": { "command": "修改后的命令" },
    "retry": true,
    "decision": "continue | stop"
  },
  "additionalContext": "注入到上下文的文字",
  "systemMessage": "控制台显示的提示词",
  "suppressOutput": true
}
```

字段说明：

| 字段 | 适用事件 | 说明 |
| --- | --- | --- |
| `permissionDecision` | `PreToolUse`, `PermissionRequest` | 返回 `"allow"`、`"deny"` 或 `"ask"` 以控制权限决策 |
| `permissionDecisionReason` | `PreToolUse`, `PermissionRequest` | 当 `permissionDecision` 为 `"deny"` 时，向 Claude 说明拦截原因 |
| `updatedInput` | `PreToolUse` | 允许钩子修改工具的输入参数。例如在执行 Bash 前替换实际的命令字符串 |
| `retry` | `PermissionDenied` | 设为 `true` 时，Claude 会重新尝试该工具调用 |
| `decision` | `Stop` | 设为 `"continue"` 可强制 Claude 继续执行而非结束回合 |

---

## 6. 退出码语义

| 退出码 | 含义 |
| :---: | --- |
| `0` | 成功，允许操作继续运行 |
| `2` | 强行阻断（Block），当前工具调用或操作被终止，`stderr` 内容将作为反馈发送给 Claude |
| 其他 | 非阻塞错误，显示警告但流程继续 |

---

## 7. 规范配置模板

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "检查该 Bash 命令是否包含破坏性操作"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '工具执行完成'"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "如果任务未完成，请指示模型继续。"
          }
        ]
      }
    ]
  },
  "allowedHttpHookUrls": ["https://audit.example.com/*"]
}
```

---

## 8. 调试与查看

在 Claude Code 会话中输入 `/hooks` 斜杠命令，可只读查看当前 session 中所有已生效的 hook 配置，便于调试配置是否加载正确。

---

