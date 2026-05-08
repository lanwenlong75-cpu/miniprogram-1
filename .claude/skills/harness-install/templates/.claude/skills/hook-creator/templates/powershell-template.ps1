# Hook 脚本：{HOOK_NAME}
# 触发事件：{EVENT_NAME}    匹配器：{MATCHER}
# 用途：{PURPOSE}
#
# stdin JSON 常用字段：
#   session_id        当前会话唯一标识
#   hook_event_name   触发事件名（如 "PreToolUse"）
#   cwd               当前工作目录
#   tool_name         工具名（如 "Bash"、"Edit"）
#   tool_input        工具输入参数对象
#   tool_response     工具返回结果（仅 Post* 事件）
#
# 退出码：
#   exit 0  → 成功，操作继续
#   exit 2  → 强行阻断，stderr 内容反馈给 Claude（仅可阻塞事件）
#   其它    → 非阻塞警告

$ErrorActionPreference = 'Stop'

# ──────────── 读取 stdin JSON ────────────
# 注意：用 $input | Out-String，不要用 [Console]::In.ReadToEnd()
# 后者在 hook 场景下会挂住等待输入
$raw = $input | Out-String

# SessionStart 等事件 stdin 可能为空，直接跳过解析
if (-not [string]::IsNullOrWhiteSpace($raw)) {
    try {
        $payload  = $raw | ConvertFrom-Json
        $toolName = $payload.tool_name
        $cwd      = $payload.cwd
        # 按需取消注释：
        # $toolInput = $payload.tool_input
    } catch {
        # JSON 解析失败，静默退出
        exit 0
    }
}

# ──────────── 主逻辑（请替换） ────────────
# TODO: 在此实现 hook 行为

# ──────────── 退出 ────────────
exit 0