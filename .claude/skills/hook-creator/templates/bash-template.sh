#!/usr/bin/env bash
# Hook 脚本：{HOOK_NAME}
# 触发事件：{EVENT_NAME}    匹配器：{MATCHER}
# 用途：{PURPOSE}
#
# stdin JSON 字段（详见 hook-guild.md §5.1）：
#   .session_id        当前会话唯一标识
#   .hook_event_name   触发事件名（如 "PreToolUse"）
#   .cwd               当前工作目录
#   .tool_name         工具名（如 "Bash"、"Edit"）
#   .tool_input        工具输入参数对象
#   .tool_response     工具返回结果（仅 Post* 事件）
#
# 退出码语义：
#   exit 0  → 成功，操作继续
#   exit 2  → 强行阻断，stderr 内容反馈给 Claude（仅可阻塞事件，详见 hook-guild.md §6）
#   其它    → 非阻塞错误，显示警告但流程继续

set -euo pipefail

# ──────────── 解析 stdin JSON ────────────
payload=$(cat)
tool_name=$(echo "$payload" | jq -r '.tool_name // empty')
cwd=$(echo "$payload" | jq -r '.cwd // empty')
# 按需补充：
# tool_input=$(echo "$payload" | jq -r '.tool_input // empty')

# ──────────── 主逻辑（请替换） ────────────
# TODO: 在此实现 hook 行为

# ──────────── 退出 ────────────
exit 0
