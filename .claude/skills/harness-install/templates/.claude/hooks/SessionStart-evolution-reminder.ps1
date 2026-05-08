if ($env:EVOLUTION_RUNNER -eq "1") { exit 0 }

$day = (Get-Date).DayOfWeek.value__
$trigger = @(0, 1, 3, 5)

if ($trigger -Contains $day) {
    $hookDir = "{{PROJECT_ROOT_WINDOWS}}\\.claude\\hooks"
    $lockFile = "$hookDir\evolution-$(Get-Date -Format 'yyyyMMdd').lock"

    if (Test-Path $lockFile) { exit 0 }

    Get-ChildItem "$hookDir\evolution-*.lock" | Remove-Item -Force

    New-Item -ItemType File -Path $lockFile -Force | Out-Null

    $cmd = "`$env:EVOLUTION_RUNNER='1'; claude --dangerously-skip-permissions --print 'use the self-evolve skill'"
    Start-Process powershell -ArgumentList "-Command", $cmd
}