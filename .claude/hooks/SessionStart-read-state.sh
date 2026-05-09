#!/usr/bin/env bash
# SessionStart hook: read project state
# stdout injected into Claude context

STATE_FILE="/g/万能库/关于我/微信小程序/有啥做啥/miniprogram-1/.claude/项目状态.md"

echo '```project-state'
if [ -f "$STATE_FILE" ]; then
    cat "$STATE_FILE"
else
    echo "<!-- project state file not found: $STATE_FILE -->"
fi
echo '```'
