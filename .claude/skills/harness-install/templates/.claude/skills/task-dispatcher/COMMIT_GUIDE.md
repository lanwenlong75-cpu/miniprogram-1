---
name: task-dispatcher-commit-guide
description: Git Commit 统一策略，供 task-dispatcher 引用
---

# Git Commit 统一策略

> 所有项目中的 commit 规则以本节为准，如有冲突以此为准。

## 必须 commit 的 4 种场景

| 场景 | 触发时机 | commit message 格式 | 目的 |
|------|---------|-------------------|------|
| **1. 基准锁定** | 方案规划写完、正式开发前 | `plan: xxx功能方案规划` | 保存方案基准，后续熔断时可 reset 到这里 |
| **2. 开发检查点** | 完成一个子任务后 | `feat: 实现xxx` 或 `checkpoint: 完成n/m项` | 保存可编译通过的代码，防止中断丢失进度 |
| **3. 状态同步** | 任务完成 / 分支合并 / feedback 达阈值 | `chore: 更新 PROJECT_STATE` | 保存项目状态快照 |
| **4. 最终交付** | 审查通过、用户确认后合并到主线 | `feat: xxx功能（合并到主线）` | 正式交付 |

## 通用规范

- message 前缀：`feat:`、`fix:`、`refactor:`、`chore:`、`plan:`
- 每次 commit 前必须 `{{BUILD_CMD}}` 通过（如有编译）
- 绝不提交标记为 "WIP" 或 "temp" 的损坏代码
- 切换分支前：未提交的修改必须 `git commit`
