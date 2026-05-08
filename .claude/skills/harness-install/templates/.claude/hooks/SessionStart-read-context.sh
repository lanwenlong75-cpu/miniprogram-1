#!/usr/bin/env bash
# SessionStart hook: read all context files
# stdout injected into Claude context

CONTEXT_DIR="{{PROJECT_ROOT}}/.claude/context"

find "$CONTEXT_DIR" -maxdepth 1 -name '*.md' -print0 | while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    printf '%s\n' "\`\`\`context-${filename}"
    cat "$file"
    printf '%s\n' '\`\`\`'
    echo ""
done
