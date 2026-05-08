#!/usr/bin/env bash
# SessionStart hook: read all context files
# stdout injected into Claude context

CONTEXT_DIR="/g/万能库/关于我/微信小程序/有啥做啥/miniprogram-1/.claude/context"

find "$CONTEXT_DIR" -maxdepth 1 -name '*.md' -print0 | while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    printf '%s\n' "\`\`\`context-${filename}"
    cat "$file"
    printf '%s\n' '\`\`\`'
    echo ""
done
