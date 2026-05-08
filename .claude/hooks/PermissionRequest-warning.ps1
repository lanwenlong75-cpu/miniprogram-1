# Hook 脚本：PermissionRequest-warning
# 触发事件：PermissionRequest    匹配器：（无）
# 用途：权限确认框弹出前播放 warning.mp3 提醒用户
#
# stdin JSON 字段（详见 hook-guild.md §5.1）：
#   session_id        当前会话唯一标识
#   hook_event_name   触发事件名
#   cwd               当前工作目录
#   tool_name         工具名
#   tool_input        工具输入参数对象

$ErrorActionPreference = 'SilentlyContinue'

# ──────────── 主逻辑：播放 warning.mp3 ────────────
Add-Type -AssemblyName PresentationCore
$m = New-Object Windows.Media.MediaPlayer
$path = [System.IO.Path]::GetFullPath('.claude/hooksounds/warning.mp3')
$m.Open($path)
$m.Play()
Start-Sleep -s 1

# ──────────── 退出 ────────────
# 不阻断权限确认框，仅作为提醒
exit 0
