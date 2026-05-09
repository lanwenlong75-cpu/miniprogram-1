---
name: hook-creator
description: 当用户想要创建 Claude Code Hook、配置生命周期事件钩子（如 PreToolUse、PostToolUse、SessionStart 等）、自动化代理行为、拦截工具调用、注入上下文，或表达"做一个 hook"、"加一个钩子"、"配置自动化"、"自动跑测试/格式化/通知"之类需求时，快速理解意图并生成可直接运行的 settings.json 配置和脚本文件。
allowed-tools: [Read, Edit, Write, Bash, Grep]
---

# Hook Creator

专业生成可直接运行的 Claude Code Hook 配置和脚本。**首要目标：生成的文件一次跑通，不需要用户反复调试。**

## 核心原则

1. **能一步搞清楚的不追问** — 从用户第一句话推断尽可能多的信息，只问真正不确定的
2. **路径优先用绝对路径** — 相对路径是最常见的失败原因，尤其 Windows
3. **Windows/Mac/Linux 生成完全不同的脚本** — 不能混用
4. **先检测 OS，再写任何脚本**
5. **生成后给用户验证命令** — 让用户能自己确认是否成功

---

## 阶段一：快速理解意图（最多 1 轮追问）

从用户描述中直接提取：

| 提取项 | 说明 |
|---|---|
| 触发时机 | 工具执行前/后？Session 开始？用户提交消息前？ |
| 触发目标 | 哪个工具？（Bash / Edit / Write / 全部） |
| 要做什么 | 格式化、阻断、通知、注入上下文、执行脚本？ |
| 失败策略 | 阻断还是只警告？ |

**如果以上四项都能从用户描述中推断** → 跳过追问，直接进阶段二。

**只有真正不确定时才问一个问题**，例如：
- "你想在 Claude 写完文件之后格式化，还是写之前检查？"
- "如果检查失败，是阻断 Claude 继续，还是只打日志？"

---

## 阶段二：检测 OS（必须在写任何脚本之前）

```bash
uname -s 2>/dev/null || echo "Windows"
```

| 输出 | OS | 脚本格式 | shell 关键字 |
|---|---|---|---|
| Darwin | Mac | `.sh` | `bash` |
| Linux | Linux | `.sh` | `bash` |
| Windows / MINGW* / MSYS* | Windows | `.ps1` | `powershell` |

---

## 阶段三：事件选择

常用场景快速映射：

| 用户描述 | 事件 | matcher 示例 |
|---|---|---|
| Claude 写完/编辑完文件后做 X | `PostToolUse` | `Edit\|Write\|MultiEdit` |
| Claude 跑命令前检查/阻断 | `PreToolUse` | `Bash` |
| Session 开始时做 X | `SessionStart` | 可省略（全匹配） |
| Claude 完成回答后做 X | `Stop` | （不支持 matcher） |
| 用户发消息前过滤/增强 | `UserPromptSubmit` | （不支持 matcher） |
| 工具失败后通知 | `PostToolUseFailure` | 工具名 |

> 不确定时读 `${CLAUDE_SKILL_DIR}/reference/hook-guild.md` §4 查完整事件表。

---

## 阶段四：生成配置和脚本

### 4.1 判断是否需要脚本文件

| 用内联 command 的情况 | 用脚本文件的情况 |
|---|---|
| 单行命令，无条件判断 | 多行逻辑 |
| 不需要读 stdin | 需要解析 stdin JSON |
| 无变量/循环 | 含变量、循环、错误处理 |

### 4.2 Windows 路径规则（重要）

**Windows 下 hook 的 command 字段必须用绝对路径，禁止相对路径。**

原因：hook 执行时工作目录不确定，相对路径必然失败。

获取绝对路径的方式：
```bash
# 在项目目录下运行，获取当前绝对路径
pwd  # Mac/Linux
cd   # Windows CMD（输出当前目录）
```

settings.json 中的写法（Windows）：
```json
"command": "powershell -ExecutionPolicy Bypass -File \"C:\\Users\\用户名\\项目路径\\.claude\\hooks\\脚本名.ps1\""
```

**注意**：`$CLAUDE_PROJECT_DIR` 环境变量在部分版本可用，但不稳定，不推荐作为唯一方案。

### 4.3 生成脚本文件

**脚本命名规则**：`.claude/hooks/{事件名}-{用途}.{sh|ps1}`

例：
- `.claude/hooks/PostToolUse-prettier.ps1`
- `.claude/hooks/PreToolUse-block-rm.sh`
- `.claude/hooks/SessionStart-evolution.ps1`

#### Windows PowerShell 模板

```powershell
# Hook：{用途描述}
# 事件：{EVENT_NAME}  匹配器：{MATCHER}

$ErrorActionPreference = 'Stop'

# ── 读取 stdin JSON（Claude Code 通过 stdin 传入事件数据）──
$raw = $input | Out-String
if ([string]::IsNullOrWhiteSpace($raw)) {
    # SessionStart 等事件有时 stdin 为空，正常退出
    exit 0
}

try {
    $payload = $raw | ConvertFrom-Json
} catch {
    exit 0
}

$toolName = $payload.tool_name
$cwd      = $payload.cwd
# $toolInput = $payload.tool_input   # 按需取消注释

# ── 主逻辑 ──
# TODO: 在此填写 hook 行为

# ── 退出码 ──
# exit 0  → 成功，继续
# exit 2  → 阻断，stderr 内容会反馈给 Claude
# 其他    → 非阻断警告
exit 0
```

**关键修正**：用 `$input | Out-String` 替代 `[Console]::In.ReadToEnd()`，后者在 hook 场景下经常挂住。

#### Mac/Linux Bash 模板

```bash
#!/usr/bin/env bash
# Hook：{用途描述}
# 事件：{EVENT_NAME}  匹配器：{MATCHER}

set -euo pipefail

# ── 读取 stdin JSON ──
payload=$(cat)
tool_name=$(echo "$payload" | jq -r '.tool_name // empty')
cwd=$(echo "$payload"       | jq -r '.cwd // empty')
# tool_input=$(echo "$payload" | jq -r '.tool_input // empty')

# ── 主逻辑 ──
# TODO: 在此填写 hook 行为

exit 0
```

### 4.4 SessionStart 特殊说明

SessionStart 的 stdout 会被注入为 Claude 的上下文，**但脚本本身不需要读 stdin**（或读到的是空）。

```powershell
# SessionStart hook 示例 — 不需要读 stdin
$day = (Get-Date).DayOfWeek.value__
if (@(1,3,5) -contains $day) {
    # 直接执行操作，stdout 会注入上下文
    Write-Output "## 今日提示：这是 Evolution Day"
}
exit 0
```

### 4.5 settings.json 写入规则

1. 用 `Read` 读取目标文件（不存在则创建）
2. **追加**到现有 hooks 数组，不替换
3. 用 `Edit` 写回，4 空格缩进

完整结构参考：
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -ExecutionPolicy Bypass -File \"C:\\绝对路径\\.claude\\hooks\\PostToolUse-format.ps1\""
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell -ExecutionPolicy Bypass -File \"C:\\绝对路径\\.claude\\hooks\\SessionStart-evolution.ps1\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

---

## 阶段五：Ding 听觉确认 hook

每次创建 hook 后，在**全局**配置追加 ding hook（不是项目级）：

- **写入位置**：`~/.claude/settings.json`（全局，跨项目生效）
- **不**写入 `.claude/settings.json`（项目级，换项目就没了）

去重检查：
```bash
grep -E "ding\.mp3|play-stop\.ps1" ~/.claude/settings.json 2>/dev/null
```

| OS | command |
|---|---|
| Windows | `powershell -ExecutionPolicy Bypass -File .claude/hooksounds/play-stop.ps1` |
| Mac | `afplay .claude/hooksounds/ding.mp3` |
| Linux | `mpg123 -q .claude/hooksounds/ding.mp3 \|\| paplay .claude/hooksounds/ding.mp3` |

---

## 阶段六：交付与验证命令

完成后输出：

```
## Hook 创建完成

### 生成文件
- 脚本：{绝对路径}
- 配置：{settings.json 路径}

### 立即验证（在 PowerShell 里运行）
# 1. 确认脚本存在
Test-Path "{脚本绝对路径}"

# 2. 手动运行脚本测试
& "{脚本绝对路径}"

# 3. 重启 Claude Code，在 CLI 内输入查看生效的 hooks
/hooks
```

---

## 常见失败原因速查

| 症状 | 原因 | 修复 |
|---|---|---|
| `Failed with non-blocking status code: -File` | 路径不存在或路径含空格未加引号 | 用 `Test-Path` 确认，路径加双引号 |
| Hook 触发但什么都没发生 | 条件判断未满足（如日期不对） | 加调试日志 `Add-Content log.txt "triggered"` |
| PowerShell 脚本挂住不退出 | `[Console]::In.ReadToEnd()` 等待输入 | 改用 `$input \| Out-String` |
| 无限递归（新 session 触发 hook 触发新 session） | 缺少进程标记 | 脚本开头加 `if ($env:MY_FLAG -eq "1") { exit 0 }` |
| 引号错误 `unknown option '---'` | md 文件内容含特殊字符被当命令行参数 | 不要把文件内容拼入命令，改用文件路径或 agent 名 |

---

## 安全约束

- 不用 `$ARGUMENTS` 或用户输入直接拼接命令
- 不对脚本 `chmod +x`，始终显式用 `bash` / `powershell -File` 调用
- HTTP hook 必须先加 `allowedHttpHookUrls` 白名单
- 不自动启用 `async: true`，除非用户明确要求
