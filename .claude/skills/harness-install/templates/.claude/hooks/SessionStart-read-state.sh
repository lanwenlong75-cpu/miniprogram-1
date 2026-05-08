#!/usr/bin/env bash
# SessionStart hook: read project state
# stdout injected into Claude context

STATE_FILE="{{PROJECT_ROOT}}/.claude/项目状态.md"

echo '```project-state'
if [ -f "$STATE_FILE" ]; then
    cat "$STATE_FILE"
else
    echo "<!-- project state file not found: $STATE_FILE -->"
fi
echo '```'
