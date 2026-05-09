#!/usr/bin/env bash
# Hook：进化提醒
# 事件：SessionStart（周一三五日触发 self-evolve）
set -euo pipefail

if [ "${EVOLUTION_RUNNER:-}" = "1" ]; then exit 0; fi

day=$(date +%w)  # 0=Sun, 1=Mon, ...
case "$day" in
  0|1|3|5) ;;
  *) exit 0 ;;
esac

hookDir="{{PROJECT_ROOT}}/.claude/hooks"
lockFile="$hookDir/evolution-$(date +%Y%m%d).lock"

if [ -f "$lockFile" ]; then exit 0; fi

rm -f "$hookDir"/evolution-*.lock
touch "$lockFile"

EVOLUTION_RUNNER=1 claude --dangerously-skip-permissions --print 'use the self-evolve skill' &
