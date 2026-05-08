***

name: harness-install
description: 在新项目中一键安装 Harness 多 Agent 协作开发框架。触发词包括"安装 Harness"、"搭建 Harness"、"复刻 Harness"、"装骨架"、"配置多 Agent"。适用任何项目类型（Android、iOS、Web前端、后端、小程序、Flutter、桌面软件等）。先扫描项目代码自动填写配置清单，只有代码中无法确定的信息才向用户提问。
allowed-tools: \[Read, Write, Bash, Edit, Glob, Grep, AskUserQuestion]
----------------------------------------------------------------------

# Harness Install — 多 Agent 协作框架一键安装器

你是 Harness 框架安装向导。

**核心逻辑**：先扫描项目代码 → 自动填写配置清单 → 填不出的才问用户 → 确认后一键生成全部文件。

***

## 阶段 0：环境自动检测

执行以下命令，无条件：

```bash
pwd
uname -s 2>/dev/null || echo "Windows"
git branch --show-current 2>/dev/null || echo "no-git"
git remote get-url origin 2>/dev/null || echo "no-remote"
ls -la
```

记录结果：

| 检测项       | 命令                          | 存入变量                                |
| --------- | --------------------------- | ----------------------------------- |
| 项目根目录绝对路径 | `pwd`                       | `{{PROJECT_ROOT}}`                  |
| 操作系统      | `uname -s`                  | `{{OS}}` → Darwin / Linux / Windows |
| 当前分支名     | `git branch --show-current` | `{{CURRENT_BRANCH}}`                |
| Git 远程地址  | `git remote get-url origin` | `{{GIT_REMOTE}}`                    |
| 根目录文件列表   | `ls -la`                    | 用于项目类型初判                            |

从 Git 远程地址推断 `{{GIT_PLATFORM}}`：

- 包含 `github.com` → `github`
- 包含 `gitee.com` → `gitee`
- 包含 `gitlab` → `gitlab`
- 其他/无 → `unknown`

### Git 环境检查与初始化

如果 `git branch` 返回 `no-git` 或 `fatal: not a git repository`：

```bash
git init
git checkout -b {{MAIN_BRANCH}}   # 默认 main
```

然后检查 git 用户配置：

```bash
git config user.name  2>/dev/null || echo "not-set"
git config user.email 2>/dev/null || echo "not-set"
```

如果未配置，用 AskUserQuestion 提示用户：

```
问题 header:"Git配置" — Git 用户名和邮箱未设置，需要配置后才能正常使用。请提供：
（用户通过 Other 选项自由输入 "用户名 <邮箱>"）
```

收到后执行：

```bash
git config user.name "{{USER_NAME}}"
git config user.email "{{USER_EMAIL}}"
```

然后做初始提交（如果项目不为空）：

```bash
git add -A
git commit -m "chore: initial commit"
```

***

## 阶段 0.5：判断项目阶段（空项目 vs 存量项目）

这是整个安装流程的**关键分叉点**。在深入扫描之前，先回答一个问题：

### 从 `ls -la` 结果判定

看根目录下**除了** **`.git`、`README.md`、`.gitignore`** **之外**还有什么：

#### 判定为「空项目」的条件（满足任一）：

- 根目录下**没有任何源码文件**（无 `.kt` / `.swift` / `.tsx` / `.py` / `.go` / `.dart` / `.rs` / `.c` / `.cpp` / `.js` / `.vue` 等）
- 根目录下**没有任何构建配置文件**（无 `package.json` / `build.gradle*` / `Cargo.toml` / `go.mod` / `pyproject.toml` / `pubspec.yaml` / `*.xcodeproj` / `CMakeLists.txt` / `app.json` / `Makefile` 等）
- 只有一个 `README.md` 或只有 `.git/` 目录
- 是刚 `git init` 或 `npx create-xxx` 还没来得及写代码的状态

#### 判定为「存量项目」的条件：

- 存在上述任何源码文件或构建配置文件

### → 空项目：跳到阶段 1B（空项目引导式询问）

### → 存量项目：继续阶段 1（深度扫描自动填写）

***

## 阶段 1B：空项目 — 引导式询问

> 空项目没有代码可扫描。直接通过 4 个关键问题收集全部必需信息。
> 顺序逐一提问，不要一口气全问。

### 第 1 问：项目身份

用 AskUserQuestion 工具提问：

```
问题 header:"项目名称" — 项目叫什么名字？
（用户自由输入）

问题 header:"项目用途" — 一句话描述这个项目是做什么的？
（用户自由输入，或选择预设类型）
```

如果用户选了预设类型，同时得到了 `{{PROJECT_PURPOSE}}` 和 `{{PLATFORM}}` 的线索。

### 第 2 问：技术栈（核心问题）

用 AskUserQuestion 工具提问：

```
问题 header:"技术栈" — 你打算用什么语言/框架开发？
选项（含推荐）：
- "Android / Kotlin / Jetpack Compose"
- "iOS / Swift / SwiftUI"
- "React / TypeScript（Web 前端）"
- "Vue / TypeScript（Web 前端）"
- "微信小程序"
- "Python / FastAPI（后端）"
- "Python / Django（全栈）"
- "Go（后端/CLI）"
- "Rust（后端/系统）"
- "Flutter / Dart（跨平台移动端）"
- "Node.js / TypeScript（后端）"
- "Next.js / TypeScript（全栈）"
- Other（让用户自由描述）
```

根据用户选择，自动填充以下清单项：

| 用户选择           | → B1 语言    | → B2 版本 | → B3 平台 | → C1 构建工具  | → C2 构建命令                 | → C3 测试命令               |
| -------------- | ---------- | ------- | ------- | ---------- | ------------------------- | ----------------------- |
| Android/Kotlin | Kotlin     | 2.0+    | Android | Gradle     | `./gradlew assembleDebug` | `./gradlew test`        |
| iOS/Swift      | Swift      | 5.9+    | iOS     | Xcode      | `xcodebuild build`        | `xcodebuild test`       |
| React/TS       | TypeScript | 5.x     | Web     | npm/yarn   | `npm run build`           | `npm test`              |
| Vue/TS         | TypeScript | 5.x     | Web     | npm/yarn   | `npm run build`           | `npm test`              |
| 微信小程序          | JS/TS      | —       | 小程序     | npm        | `npm run build`           | —                       |
| Python/FastAPI | Python     | 3.11+   | 服务端     | pip/poetry | `python -m pytest`        | `python -m pytest`      |
| Python/Django  | Python     | 3.11+   | 服务端     | pip/poetry | `python manage.py test`   | `python manage.py test` |
| Go             | Go         | 1.21+   | 服务端/CLI | Go modules | `go build ./...`          | `go test ./...`         |
| Rust           | Rust       | 1.75+   | 服务端/CLI | Cargo      | `cargo build`             | `cargo test`            |
| Flutter/Dart   | Dart       | 3.x     | 移动端     | Flutter    | `flutter build`           | `flutter test`          |
| Node.js/TS     | TypeScript | 5.x     | 服务端     | npm/yarn   | `npm run build`           | `npm test`              |
| Next.js/TS     | TypeScript | 5.x     | Web     | npm/yarn   | `npm run build`           | `npm test`              |

同时自动填充 E/F/G 组（UI框架、数据层、架构模式）的**推荐默认值**：

- Android → Compose + Room + Hilt + MVVM
- iOS → SwiftUI + CoreData + 手动DI + MVVM
- React → React + 无ORM + Context + hooks
- Vue → Vue + 无ORM + Pinia + Composition API
- 后端项目 → UI 框架填 N/A

这些默认值不需要用户确认——它们是基于语言的最佳实践，会在阶段 4 摘要中展示。

**如果用户选了 Other**：追问"能具体描述一下技术栈吗？语言、框架、构建方式？"

### 第 3 问：协作模式 + UI 审查

用 AskUserQuestion 工具提问：

```
问题 1 header:"协作模式" — 一个人开发，还是多人协作？
  选项: "单人开发" / "多人协作"

问题 2 header:"UI审查" — 是否启用 UI 深度设计审查？
  （仅当第 2 问选了有 UI 框架的技术栈时才问）
  选项: "启用" / "跳过"
```

### 第 4 问：确认摘要 → 直接跳到阶段 5 生成

展示完整清单，用户确认后跳到阶段 5。不需要走阶段 1（深度扫描）和阶段 3（补充询问）——因为所有信息已经通过这 4 问收集齐了。

***

## 阶段 1：存量项目 — 深度扫描 → 填写配置清单

> 本章仅对「存量项目」执行。空项目已通过阶段 1B 收集完信息，跳过本章。

### 1.1 项目类型初判（看根目录有哪些"签名文件"）

扫描根目录文件列表，匹配以下签名：

| 签名文件                                                | 项目类型             | 主语言           | 构建工具          |
| --------------------------------------------------- | ---------------- | ------------- | ------------- |
| `build.gradle.kts` / `build.gradle`                 | Android / Kotlin | Kotlin/Java   | Gradle        |
| `package.json` + `next.config.*`                    | Next.js          | TypeScript    | npm/yarn/pnpm |
| `package.json` + `vite.config.*`                    | Vite 前端          | TypeScript    | npm/yarn/pnpm |
| `package.json` + `vue.config.*` / `nuxt.config.*`   | Vue / Nuxt       | TypeScript    | npm/yarn/pnpm |
| `package.json` + `angular.json`                     | Angular          | TypeScript    | npm/yarn/pnpm |
| `package.json` + `app.json` / `project.config.json` | 微信小程序            | TypeScript/JS | npm           |
| `package.json`（无上述框架特征）                             | Node.js 通用       | TypeScript    | npm/yarn/pnpm |
| `Cargo.toml`                                        | Rust             | Rust          | Cargo         |
| `go.mod`                                            | Go               | Go            | Go modules    |
| `pyproject.toml` / `setup.py` / `requirements.txt`  | Python           | Python        | pip/poetry    |
| `pubspec.yaml`                                      | Flutter/Dart     | Dart          | Flutter       |
| `Podfile` / `*.xcodeproj` / `*.xcworkspace`         | iOS              | Swift/ObjC    | Xcode         |
| `CMakeLists.txt`                                    | C/C++            | C/C++         | CMake         |
| `Makefile`（无其他签名）                                   | 通用 C/C++         | C/C++         | Make          |
| `app.json`（无 package.json）                          | 微信小程序原生          | JS            | 微信开发者工具       |

如果没有匹配到任何签名文件 → 进入「非标存量项目」子流程：

**非标存量项目处理**（有代码文件但签名不匹配）：

1. 用 Glob 扫描根目录下所有源码文件（不限语言），了解实际文件类型：
   ```bash
   Glob: **/*.{kt,java,swift,ts,tsx,js,jsx,vue,py,go,rs,dart,c,cpp,h,jsp,php,rb}
   ```
2. 如果有源码文件但无标准构建配置 → 项目可能是：
   - 脚本型项目（几个 .py / .sh / .js 脚本）→ 按脚本语言推断
   - 无构建系统的老项目 → 手动询问用户
3. 如果连源码文件都没有 → 回退到阶段 1B 空项目流程

**对于非标项目（有代码但无标准配置）**：收集到信息后跳转到阶段 3，用 AskUserQuestion 向用户补充确认以下内容：

- 项目名称和用途
- 构建/运行方式（没有标准命令时）
- 语言版本

### 1.2 深度读取配置文件（根据项目类型选择读取策略）

#### 如果是 Android 项目（有 build.gradle\*）

```bash
# 读取所有关键配置
Read: build.gradle.kts 或 build.gradle（项目级）
Read: app/build.gradle.kts 或 app/build.gradle（模块级）
Read: settings.gradle.kts 或 settings.gradle
Read: gradle/libs.versions.toml（版本目录，如有）
Read: app/src/main/AndroidManifest.xml（如有）
Glob: app/src/main/java/**/*.kt（了解包结构）
```

从中提取：

- 项目名：`settings.gradle.kts` 中的 `rootProject.name`
- 包名：`app/build.gradle.kts` 中的 `applicationId` 或 `namespace`
- 源码目录：`app/src/main/java/` + 包路径
- Min/Target SDK：`minSdk` / `targetSdk`
- Kotlin/AGP 版本：`libs.versions.toml` 或 build 文件
- 关键依赖：从 `dependencies` 块提取（Compose、Room、Hilt、Retrofit 等）
- 编译命令：`./gradlew assembleDebug`
- 测试命令：`./gradlew test`

#### 如果是 Node.js/前端项目（有 package.json）

```bash
Read: package.json
Read: tsconfig.json（如有）
Read: 框架配置文件（next.config.* / vite.config.* / vue.config.* / nuxt.config.* / angular.json）
Read: tailwind.config.*（如有）
Read: .eslintrc.* / .prettierrc.*（如有）
Glob: src/**/*.{ts,tsx,jsx,vue,svelte}（了解源码结构）
```

从中提取：

- 项目名：`package.json` 的 `name`
- 项目用途：`package.json` 的 `description`
- 语言：有 `tsconfig.json` → TypeScript；否则 JavaScript
- 框架：从 `dependencies` 提取（react、vue、next、nuxt、@angular/core、svelte）
- CSS 方案：tailwindcss、styled-components、sass
- 组件库：antd、@mui/material、@shadcn/ui、element-plus
- 状态管理：redux、zustand、pinia、mobx
- 路由：react-router、vue-router、@angular/router
- HTTP 客户端：axios、@tanstack/react-query、swr
- 构建命令：`package.json` 的 `scripts.build`
- 测试命令：`package.json` 的 `scripts.test`
- Lint 命令：`package.json` 的 `scripts.lint`
- 数据库/ORM：prisma、drizzle-orm、typeorm、mongoose（如有）
- 源码目录：通常 `src/`
- 入口文件：`package.json` 的 `main` 或 `module`

#### 如果是小程序项目（有 app.json / project.config.json）

```bash
Read: package.json（如有）
Read: app.json
Read: project.config.json
Read: tsconfig.json（如有）
Glob: pages/**/*.{js,ts,wxml,wxss}
Glob: miniprogram/**/*.{js,ts,wxml,wxss}
```

从中提取：

- 项目名：`project.config.json` 的 `projectname`
- 框架：有 `usingComponents` → 原生；有 `vue` / `react` 依赖 → Taro/uni-app
- UI 库：有 `tdesign` → TDesign；有 `vant` → Vant Weapp
- 语言：有 tsconfig → TypeScript
- 构建命令：`package.json` scripts 中有 `dev` / `build:weapp`
- 源码目录：`pages/` 或 `miniprogram/`

#### 如果是 Python 项目（有 pyproject.toml / setup.py）

```bash
Read: pyproject.toml（如有）
Read: setup.py（如有）
Read: requirements.txt（如有）
Read: README.md
Glob: src/**/*.py 或直接 Glob: **/*.py（了解包结构）
```

从中提取：

- 项目名：`pyproject.toml` 的 `[project] name`
- 框架：Flask、FastAPI、Django（从 dependencies 提取）
- 数据库：SQLAlchemy、Django ORM、Peewee
- DI：FastAPI 用内置 Depends
- 测试框架：pytest、unittest
- 构建命令：`python -m pytest` / `pytest`
- 源码目录：通常 `src/` 或直接项目根目录

#### 如果是 Go 项目（有 go.mod）

```bash
Read: go.mod
Read: README.md
Glob: cmd/**/*.go
Glob: internal/**/*.go
Glob: pkg/**/*.go
```

从中提取：

- 项目名/模块：`go.mod` 的 `module`
- 框架：gin、echo、fiber、chi（从 go.mod 或源码 import 提取）
- 数据库：GORM、sqlx、ent（从 go.mod 提取）
- 构建命令：`go build ./...`
- 测试命令：`go test ./...`
- 源码目录：`cmd/` / `internal/` / `pkg/`

#### 如果是 Rust 项目（有 Cargo.toml）

```bash
Read: Cargo.toml
Read: README.md
Glob: src/**/*.rs
```

从中提取：

- 项目名：`Cargo.toml` 的 `[package] name`
- 框架：actix-web、axum、rocket、tauri（从 dependencies 提取）
- 数据库：diesel、sqlx、sea-orm
- 构建命令：`cargo build`
- 测试命令：`cargo test`

#### 如果是 Flutter 项目（有 pubspec.yaml）

```bash
Read: pubspec.yaml
Read: README.md
Glob: lib/**/*.dart
```

从中提取：

- 项目名：`pubspec.yaml` 的 `name`
- 状态管理：provider、riverpod、bloc、getx
- 数据库：drift、hive、isar
- HTTP：dio、http
- 构建命令：`flutter build`
- 测试命令：`flutter test`

#### 如果是 iOS 项目（有 \*.xcodeproj）

```bash
Glob: **/*.swift
Read: README.md
# 查看 Podfile（如有）
Bash: cat Podfile 2>/dev/null || echo "no Podfile"
# 查看 project.pbxproj 中的部署目标
Bash: grep -r "IPHONEOS_DEPLOYMENT_TARGET" *.xcodeproj/project.pbxproj | head -1
```

从中提取：

- 语言：有 .swift 文件 → Swift
- UI 框架：SwiftUI（import SwiftUI）或 UIKit
- 数据库：CoreData、Realm、GRDB
- 网络：Alamofire、URLSession
- DI：Resolver、Swinject
- 构建命令：`xcodebuild -scheme <scheme> build`
- 测试命令：`xcodebuild -scheme <scheme> test`

### 1.3 项目文档扫描（获取项目用途描述、架构信息）

不只看 README。扫描根目录及 `docs/` 下**所有 .md 文件**，按文件名优先级排序读取：

**高优先级**（最可能包含项目描述）：
```bash
Glob: README*.md                # 根目录 README 变体（README.md / README.zh.md / README_EN.md）
Glob: readme*.md                # 小写变体
```

**中优先级**（项目说明类）：
```bash
Glob: docs/*.md                 # 文档目录
Glob: ARCHITECTURE*.md          # 架构文档
Glob: CONTRIBUTING*.md          # 贡献指南
Glob: CHANGELOG*.md             # 变更日志（可提取近期功能）
Glob: DESIGN*.md                # 设计文档
Glob: PRODUCT*.md               # 产品定义
Glob: *.md                      # 根目录下其他 .md 文件
```

**读取策略**：按优先级顺序，读每个文件的前 30 行。从第一个包含项目描述信息的文件中提取 `{{PROJECT_PURPOSE}}`。如果所有文件读完仍无法提取 → 标记为"需询问"。

**额外收获**：
- 从 ARCHITECTURE.md 中可能提取到架构模式 `{{ARCH_PATTERN}}`
- 从 CHANGELOG.md 中可能了解项目近期功能变更
- 从 docs/ 中的文件名推断模块划分

### 1.4 Git 信息确认

```bash
git branch --show-current    # 当前分支 → {{CURRENT_BRANCH}}
git branch                   # 所有分支列表 → 推断 {{MAIN_BRANCH}}
```

主分支名推断：看分支列表中是否有 `main` / `master` / `develop`，优先 `main`。

***

## 阶段 2：填写配置清单

扫描完成后，逐项填写以下清单。已确定的填值，不确定的标 `[需询问]`，该项目不适用（如后端项目无UI框架）的标 `N/A`。

```markdown
## Harness 安装配置清单

### A. 项目身份证
- A1. 项目名称：[ ]
- A2. 项目一句话用途：[ ]
- A3. 项目根目录：[ ]

### B. 语言与平台
- B1. 主编程语言：[ ]
- B2. 语言版本：[ ]
- B3. 目标平台：[ ] (web / iOS / Android / 小程序 / 桌面 / 服务端 / CLI)

### C. 构建系统
- C1. 构建工具：[ ]
- C2. 编译/构建命令：[ ]
- C3. 测试命令：[ ]
- C4. Lint/代码检查命令：[ ]
- C5. 包管理器：[ ]

### D. 项目结构
- D1. 源码目录：[ ]
- D2. 测试目录：[ ]
- D3. 包名/模块标识：[ ]
- D4. 入口文件/启动点：[ ]

### E. 界面框架（无UI的项目填 N/A）
- E1. UI 框架：[ ]
- E2. CSS/样式方案：[ ]
- E3. 组件库：[ ]
- E4. 路由/导航：[ ]

### F. 数据层
- F1. 数据库/ORM：[ ]
- F2. HTTP 客户端：[ ]
- F3. 状态管理：[ ]
- F4. 缓存方案：[ ]

### G. 架构模式
- G1. 架构模式：[ ]
- G2. 依赖注入：[ ]
- G3. 并发/异步模型：[ ]

### H. 版本约束
- H1. 最低 SDK/部署目标：[ ]
- H2. 推荐版本/目标 SDK：[ ]

### I. Git 与协作
- I1. 主分支名：[ ]
- I2. Git 平台：[ ] (github / gitee / gitlab / other)
- I3. 协作模式：[ ] ⚠️ 代码无法确定

### J. UI 设计审查
- J1. 启用深度 UI 审查：[ ] ⚠️ 代码无法确定
- J2. UI 框架存在：[ ] (是 → 建议启用 / 否 → 自动跳过)

### K. 操作系统
- K1. 操作系统：[ ]
- K2. Shell 类型：[ ]
```

***

## 阶段 3：向用户确认未填项（代码扫不出来的才问）

### 3.1 判断需要问什么

遍历清单，找出所有 `[需询问]` 或 `⚠️ 代码无法确定` 的项。

**一定会问的（代码永远无法确定）**：

- I3. 协作模式：单人还是多人？
- J1. 是否启用 UI 深度审查？（仅当检测到 UI 框架时才问）

**可能会问的（代码扫不出来时）**：

- A2. 项目用途（README 无描述时）
- A1. 项目名称（配置文件中也找不到时）
- H1/H2. 版本约束（项目类型特殊时）

### 3.2 用 AskUserQuestion 工具提问

**最多 4 个问题**。按优先级合并，每轮最多 2 个。

#### 标准情况（检测到 UI 框架）：

**第一轮**（必问）：

```
问题 1 header:"协作模式" — 项目是你一个人开发，还是多人协作？
  选项: "单人开发" / "多人协作"

问题 2 header:"UI审查" — 是否启用 UI 深度设计审查？（项目已检测到 {UI框架名}）
  选项: "启用（对UI任务做深度打磨）" / "跳过（只用默认样式）"
```

#### 如果还有其他未填项，追加第二轮：

```
问题 3 header:"项目用途" — 用一句话描述这个项目是做什么的？
  选项: "（让用户自己填写）" — Other 选项让用户自由输入
```

### 3.3 用户回答后，更新清单

将用户回答填入清单对应的项。所有项都填完后，展示完整清单供最终确认。

***

## 阶段 4：生成前确认

以口语化方式展示完整的配置清单摘要：

```
## 即将为你的项目安装 Harness 框架

项目：{{PROJECT_NAME}}
用途：{{PROJECT_PURPOSE}}
技术栈：{{LANG}} + {{UI_FRAMEWORK}}（N/A 则不显示）
平台：{{PLATFORM}}
构建：{{BUILD_CMD}}  |  测试：{{TEST_CMD}}
主分支：{{MAIN_BRANCH}}
协作：{{COLLAB_MODE == "solo" ? "单人本地 merge" : "多人 PR 流程"}}
UI 设计审查：{{UI_REVIEW == true ? "已启用" : "跳过"}}
操作系统：{{OS}}

将生成约 30 个文件：
- 核心配置 3 个（CLAUDE.md / settings.local.json / 项目状态.md）
- AI 角色 3 个（scout / implementer / code-reviewer）
- 上下文文档 2 个（技术栈 / 项目背景）
- 工作流技能 12 个
- Hook 脚本 4 个
- 工作目录 6 个（任务分发/任务执行/审查/feedback/进化日志）
- Hook 音效 4 个

确认后开始生成。
```

用户确认后进入阶段 5。

***

## 阶段 5：生成文件

> **核心原则：能用 cp 就不用 AI Write。** U 型文件直接 cp，P 型文件 cp 后 sed 替换占位符。只有 N 型文件（内容由清单值动态决定）才用 Write。

### 5.0 创建目录 + 确定平台

```bash
# 统一创建所有目录
mkdir -p .claude/{agents,context,hooks,hooksounds}
mkdir -p .claude/skills/{brainstorm/reference,feedback-capture,task-dispatcher}
mkdir -p .claude/skills/{scout-run,scout-focus,scout-deep}
mkdir -p .claude/skills/{dev-builder,bug-fixer,code-review}
mkdir -p .claude/skills/{pj-log,self-evolve,hook-creator/reference,hook-creator/templates}
mkdir -p 工作目录/{任务分发,任务执行,审查,feedback,进化日志}
```

设定平台变量（阶段 0 已检测 `{{OS}}`）：

| {{OS}} 值                   | PLATFORM  | HOOK\_EXT | AUDIO\_CMD                                 |
| -------------------------- | --------- | --------- | ------------------------------------------ |
| Windows / MINGW\* / MSYS\* | `windows` | `.ps1`    | `powershell -ExecutionPolicy Bypass -File` |
| Darwin                     | `mac`     | `.sh`     | `bash`                                     |
| Linux                      | `linux`   | `.sh`     | `bash`                                     |

`TEMPLATES` = `.claude/skills/harness-install/templates/.claude`

### 5.1 第一批：通用文件批量 cp（U 型 — 不改内容）

```bash
TEMPLATES=".claude/skills/harness-install/templates/.claude"

# Agent 定义（通用）
cp "$TEMPLATES/agents/scout.md" .claude/agents/
cp "$TEMPLATES/agents/code-reviewer.md" .claude/agents/

# 通用 Skill（Leader 加载）
cp "$TEMPLATES/skills/brainstorm/SKILL.md" .claude/skills/brainstorm/
cp "$TEMPLATES/skills/brainstorm/reference/visual-companion.md" .claude/skills/brainstorm/reference/
cp "$TEMPLATES/skills/feedback-capture/SKILL.md" .claude/skills/feedback-capture/
cp "$TEMPLATES/skills/task-dispatcher/REWORK_GUIDE.md" .claude/skills/task-dispatcher/
cp "$TEMPLATES/skills/task-dispatcher/MULTI_MODULE_GUIDE.md" .claude/skills/task-dispatcher/
cp "$TEMPLATES/skills/scout-run/SKILL.md" .claude/skills/scout-run/
cp "$TEMPLATES/skills/scout-focus/SKILL.md" .claude/skills/scout-focus/
cp "$TEMPLATES/skills/scout-deep/SKILL.md" .claude/skills/scout-deep/
cp "$TEMPLATES/skills/pj-log/SKILL.md" .claude/skills/pj-log/
cp "$TEMPLATES/skills/self-evolve/SKILL.md" .claude/skills/self-evolve/
cp "$TEMPLATES/skills/hook-creator/SKILL.md" .claude/skills/hook-creator/
cp "$TEMPLATES/skills/hook-creator/reference/hook-guild.md" .claude/skills/hook-creator/reference/
cp "$TEMPLATES/skills/hook-creator/templates/bash-template.sh" .claude/skills/hook-creator/templates/
cp "$TEMPLATES/skills/hook-creator/templates/powershell-template.ps1" .claude/skills/hook-creator/templates/

# 音效文件（通用）
cp "$TEMPLATES/hooksounds/success.mp3" .claude/hooksounds/
cp "$TEMPLATES/hooksounds/ding.mp3" .claude/hooksounds/
cp "$TEMPLATES/hooksounds/warning.mp3" .claude/hooksounds/

# SessionStart 上下文注入脚本（bash 通用）
cp "$TEMPLATES/hooks/SessionStart-read-state.sh" .claude/hooks/
cp "$TEMPLATES/hooks/SessionStart-read-context.sh" .claude/hooks/

# ──── impeccable 设计智能 skill（UI 审查依赖）────
cp -r "$TEMPLATES/skills/impeccable" .claude/skills/

# ──── 自身（harness-install）────
mkdir -p .claude/skills/harness-install
cp -r .claude/skills/harness-install/templates .claude/skills/harness-install/
```

### 5.2 第二批：平台特定文件 cp（Hook 脚本 + 音频）

TEMPLATES 路径统一为 `.claude/skills/harness-install/templates/.claude`。

```bash
TEMPLATES=".claude/skills/harness-install/templates/.claude"

# ──── settings.local.json（唯一，内含 4 个平台占位符）────
cp "$TEMPLATES/settings.local.json" .claude/

# ──── 进化提醒脚本（Windows 用 .ps1，Mac/Linux 用 .sh）────
if [ "$PLATFORM" = "windows" ]; then
  cp "$TEMPLATES/hooks/SessionStart-evolution-reminder.ps1" .claude/hooks/
  cp "$TEMPLATES/hooks/PermissionRequest-warning.ps1" .claude/hooks/
  cp "$TEMPLATES/hooksounds/play-startup.ps1" .claude/hooksounds/
  cp "$TEMPLATES/hooksounds/play-stop.ps1" .claude/hooksounds/
else
  cp "$TEMPLATES/hooks/SessionStart-evolution-reminder.sh" .claude/hooks/
  chmod +x .claude/hooks/*.sh
  # 音频播放：Mac/Linux 直接 inline 命令，不需要脚本文件
fi
```

### 5.3 第三批：P 型文件 cp（含批量 sed 替换）

```bash
TEMPLATES=".claude/skills/harness-install/templates/.claude"

# ──── cp 所有 P 型文件到目标位置 ────
cp "$TEMPLATES/CLAUDE.md" .claude/
cp "$TEMPLATES/项目状态.md" .claude/
cp "$TEMPLATES/context/技术栈与构建环境.md" .claude/context/
cp "$TEMPLATES/context/项目背景与架构.md" .claude/context/
cp "$TEMPLATES/agents/implementer.md" .claude/agents/
cp "$TEMPLATES/skills/task-dispatcher/SKILL.md" .claude/skills/task-dispatcher/
cp "$TEMPLATES/skills/task-dispatcher/COMMIT_GUIDE.md" .claude/skills/task-dispatcher/
cp "$TEMPLATES/skills/dev-builder/SKILL.md" .claude/skills/dev-builder/
cp "$TEMPLATES/skills/bug-fixer/SKILL.md" .claude/skills/bug-fixer/
cp "$TEMPLATES/skills/code-review/SKILL.md" .claude/skills/code-review/
```

### 5.4 执行 sed 替换

**先处理 macOS sed 兼容性**：

```bash
case "$(uname)" in
  Darwin) SED_I="sed -i ''" ;;
  *)      SED_I="sed -i" ;;
esac
```

**所有 P 型文件列表**：

```bash
P_FILES="
.claude/CLAUDE.md
.claude/项目状态.md
.claude/settings.local.json
.claude/context/技术栈与构建环境.md
.claude/context/项目背景与架构.md
.claude/agents/implementer.md
.claude/skills/task-dispatcher/SKILL.md
.claude/skills/task-dispatcher/COMMIT_GUIDE.md
.claude/skills/dev-builder/SKILL.md
.claude/skills/bug-fixer/SKILL.md
.claude/skills/code-review/SKILL.md
.claude/hooks/SessionStart-read-state.sh
.claude/hooks/SessionStart-read-context.sh
"
```

**公共占位符替换**（所有平台通用）：

```bash
for f in $P_FILES; do
  [ ! -f "$f" ] && continue
  $SED_I "s|{{PROJECT_ROOT}}|${PROJECT_ROOT}|g" "$f"
  $SED_I "s|{{PROJECT_NAME}}|${PROJECT_NAME}|g" "$f"
  $SED_I "s|{{PROJECT_PURPOSE}}|${PROJECT_PURPOSE}|g" "$f"
  $SED_I "s|{{LANG}}|${LANG}|g" "$f"
  $SED_I "s|{{LANG_VERSION}}|${LANG_VERSION}|g" "$f"
  $SED_I "s|{{PLATFORM}}|${PLATFORM_TYPE}|g" "$f"
  $SED_I "s|{{UI_FRAMEWORK}}|${UI_FRAMEWORK}|g" "$f"
  $SED_I "s|{{ORM}}|${ORM}|g" "$f"
  $SED_I "s|{{DI}}|${DI}|g" "$f"
  $SED_I "s|{{BUILD_CMD}}|${BUILD_CMD}|g" "$f"
  $SED_I "s|{{TEST_CMD}}|${TEST_CMD}|g" "$f"
  $SED_I "s|{{LINT_CMD}}|${LINT_CMD}|g" "$f"
  $SED_I "s|{{BUILD_TOOL}}|${BUILD_TOOL}|g" "$f"
  $SED_I "s|{{PKG_MANAGER}}|${PKG_MANAGER}|g" "$f"
  $SED_I "s|{{SRC_DIR}}|${SRC_DIR}|g" "$f"
  $SED_I "s|{{TEST_DIR}}|${TEST_DIR}|g" "$f"
  $SED_I "s|{{PKG_NAME}}|${PKG_NAME}|g" "$f"
  $SED_I "s|{{ARCH_PATTERN}}|${ARCH_PATTERN}|g" "$f"
  $SED_I "s|{{ARCH_RULES_UI}}|${ARCH_RULES_UI}|g" "$f"
  $SED_I "s|{{ARCH_RULES_DATA}}|${ARCH_RULES_DATA}|g" "$f"
  $SED_I "s|{{ARCH_RULES_DI}}|${ARCH_RULES_DI}|g" "$f"
  $SED_I "s|{{ARCH_RULES_THREAD}}|${ARCH_RULES_THREAD}|g" "$f"
  $SED_I "s|{{CONCURRENCY}}|${CONCURRENCY}|g" "$f"
  $SED_I "s|{{MIN_SDK}}|${MIN_SDK}|g" "$f"
  $SED_I "s|{{TARGET_SDK}}|${TARGET_SDK}|g" "$f"
  $SED_I "s|{{MAIN_BRANCH}}|${MAIN_BRANCH}|g" "$f"
  $SED_I "s|{{GIT_PLATFORM}}|${GIT_PLATFORM}|g" "$f"
  $SED_I "s|{{UI_REVIEW}}|${UI_REVIEW}|g" "$f"
  $SED_I "s|{{TODAY}}|$(date +%Y-%m-%d)|g" "$f"
  # 多行/含特殊字符字段用 perl
  perl -i -pe "s|\{\{BUG_CATEGORIES\}\}|${BUG_CATEGORIES}|g" "$f" 2>/dev/null || true
  perl -i -pe "s|\{\{DEPENDENCIES_LIST\}\}|${DEPENDENCIES_LIST}|g" "$f" 2>/dev/null || true
done
```

**平台特定占位符替换**（仅 settings.local.json 中的 4 个）：

| 占位符                    | Windows                                                                                                                    | macOS                                                                    | Linux                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `{{HOOK_AUDIO_START}}` | `powershell -ExecutionPolicy Bypass -File .claude/hooksounds/play-startup.ps1`                                             | `afplay .claude/hooksounds/success.mp3`                                  | `mpg123 -q .claude/hooksounds/success.mp3 \|\| paplay .claude/hooksounds/success.mp3` |
| `{{HOOK_AUDIO_STOP}}`  | `powershell -ExecutionPolicy Bypass -File .claude/hooksounds/play-stop.ps1`                                                | `afplay .claude/hooksounds/ding.mp3`                                     | `mpg123 -q .claude/hooksounds/ding.mp3 \|\| paplay .claude/hooksounds/ding.mp3`       |
| `{{HOOK_EVOLUTION}}`   | `powershell -ExecutionPolicy Bypass -File "{{PROJECT_ROOT_WINDOWS}}\\.claude\\hooks\\SessionStart-evolution-reminder.ps1"` | `bash {{PROJECT_ROOT}}/.claude/hooks/SessionStart-evolution-reminder.sh` | 同 macOS                                                                               |
| `{{HOOK_WARNING}}`     | `powershell -ExecutionPolicy Bypass -File .claude/hooks/PermissionRequest-warning.ps1`                                     | `afplay .claude/hooksounds/warning.mp3`                                  | `mpg123 -q .claude/hooksounds/warning.mp3 \|\| paplay .claude/hooksounds/warning.mp3` |

```bash
# 按平台替换 settings.local.json 中的 4 个 Hook 占位符
F=".claude/settings.local.json"
case "$PLATFORM" in
  windows)
    $SED_I "s|{{HOOK_AUDIO_START}}|powershell -ExecutionPolicy Bypass -File .claude/hooksounds/play-startup.ps1|g" "$F"
    $SED_I "s|{{HOOK_AUDIO_STOP}}|powershell -ExecutionPolicy Bypass -File .claude/hooksounds/play-stop.ps1|g" "$F"
    $SED_I "s|{{HOOK_EVOLUTION}}|powershell -ExecutionPolicy Bypass -File \"${PROJECT_ROOT_WINDOWS}\\\\.claude\\\\hooks\\\\SessionStart-evolution-reminder.ps1\"|g" "$F"
    $SED_I "s|{{HOOK_WARNING}}|powershell -ExecutionPolicy Bypass -File .claude/hooks/PermissionRequest-warning.ps1|g" "$F"
    ;;
  mac)
    $SED_I "s|{{HOOK_AUDIO_START}}|afplay .claude/hooksounds/success.mp3|g" "$F"
    $SED_I "s|{{HOOK_AUDIO_STOP}}|afplay .claude/hooksounds/ding.mp3|g" "$F"
    $SED_I "s|{{HOOK_EVOLUTION}}|bash ${PROJECT_ROOT}/.claude/hooks/SessionStart-evolution-reminder.sh|g" "$F"
    $SED_I "s|{{HOOK_WARNING}}|afplay .claude/hooksounds/warning.mp3|g" "$F"
    ;;
  linux)
    $SED_I "s|{{HOOK_AUDIO_START}}|mpg123 -q .claude/hooksounds/success.mp3 || paplay .claude/hooksounds/success.mp3|g" "$F"
    $SED_I "s|{{HOOK_AUDIO_STOP}}|mpg123 -q .claude/hooksounds/ding.mp3 || paplay .claude/hooksounds/ding.mp3|g" "$F"
    $SED_I "s|{{HOOK_EVOLUTION}}|bash ${PROJECT_ROOT}/.claude/hooks/SessionStart-evolution-reminder.sh|g" "$F"
    $SED_I "s|{{HOOK_WARNING}}|mpg123 -q .claude/hooksounds/warning.mp3 || paplay .claude/hooksounds/warning.mp3|g" "$F"
    ;;
esac
```

### 5.5 第四批：条件文件 + N 型文件

**GIT\_COLLAB\_GUIDE.md**（仅当 `{{COLLAB_MODE}}` == `team`）：

```bash
if [ "{{COLLAB_MODE}}" = "team" ]; then
  cp "$TEMPLATES/skills/task-dispatcher/GIT_COLLAB_GUIDE.md" \
     .claude/skills/task-dispatcher/ 2>/dev/null || echo "GIT_COLLAB_GUIDE 模板不存在，跳过"
fi
```

**FEEDBACK-INDEX.md 和进化日志**（N 型，直接 Write）：

> 这两个文件内容简短固定，直接 Write 即可。内容已在 §5.4 中定义。

### 5.6 验证生成结果

```bash
# 统计生成的文件数
find .claude 工作目录 -type f | wc -l

# 检查是否还有未替换的占位符
grep -r "{{" .claude/ 工作目录/ --include="*.md" --include="*.json" --include="*.sh" --include="*.ps1" || echo "✅ 所有占位符已替换"

# 如果有残留占位符，列出它们
grep -rn "{{" .claude/ 工作目录/ 2>/dev/null
```

如果验证发现残留的 `{{...}}` 占位符 → 说明清单中某些字段未填充。用 sed 补充替换或手动修复。

---

## 阶段 6：写入使用说明（所有项目）

将 `HARNESS_START.md` 写入项目根目录（用户打开就能看到）：

```bash
TEMPLATES=".claude/skills/harness-install/templates/.claude"

# 替换日期和项目名占位符
cp "$TEMPLATES/HARNESS_START.md" ./HARNESS_START.md
$SED_I "s|{{TODAY}}|$(date +%Y-%m-%d)|g" ./HARNESS_START.md
$SED_I "s|{{PROJECT_NAME}}|${PROJECT_NAME}|g" ./HARNESS_START.md
```

---

## 阶段 7：设计系统初始化（仅当 UI_REVIEW == true）

```bash
if [ "${UI_REVIEW}" = "true" ]; then
  TEMPLATES=".claude/skills/harness-install/templates/.claude"
  mkdir -p .claude/设计文件
  cp "$TEMPLATES/设计文件/DESIGN.md" .claude/设计文件/
  cp "$TEMPLATES/设计文件/PRODUCT.md" .claude/设计文件/
fi
```

生成后向用户说明：

```
## 设计系统文件已就绪

.claude/设计文件/DESIGN.md   — 设计系统快照（颜色/字体/间距/组件）
.claude/设计文件/PRODUCT.md  — 产品定位（用户画像/反例/战略原则）

当前内容是模板示例，需要替换为你的产品。

### 获取你项目的 DESIGN.md 和 PRODUCT.md

在 Claude Code 中发送：

  请使用 impeccable skill 来帮我获取 PRODUCT 和 DESIGN 文档，并存放到设计文件目录中

AI 会自动引导你完成产品发现和设计系统提取。
```

---

## 阶段 8：交付

项目 AI 协作骨架已就绪。

### 重要文件位置
- **使用说明**：项目根目录的 `HARNESS_START.md`
- **设计系统**（如启用）：`.claude/设计文件/`

### 协作模式：{solo → 单人本地 merge / team → 多人 PR 流程}
### UI 设计审查：{true → 已启用 / false → 跳过（后续可开启）}

### 生成内容
- 核心配置：CLAUDE.md / settings.local.json / 项目状态.md
- AI 角色：scout（侦察）/ implementer（编码）/ code-reviewer（审查）
- 上下文文档：技术栈与构建环境 / 项目背景与架构
- 工作流技能：12 个（brainstorm / task-dispatcher / dev-builder / ...）
- Hook 系统：SessionStart 注入上下文 + 进化提醒 + 听觉反馈
- 工作目录：任务分发/执行/审查/feedback/进化日志

### 现在开始使用
打开新的 Claude Code 会话，告诉 Leader 你的需求。
流程自动：需求沟通 → 方案规划 → 编码实现 → 代码审查 → 合并主干。

### 占位符检查
运行以下命令检查是否还有未替换的占位符：
grep -r "TODO\|{{" .claude/ 工作目录/ --include="*.md" --include="*.json"
```

***

## 附录 A：安装完整流程图

```
阶段 0: pwd / uname / git / ls → 自动检测环境

阶段 0.5: ls -la 结果
  ├─ 空项目（无源码/无配置）→ 阶段 1B
  │   ├─ 第1问: 项目名 + 用途
  │   ├─ 第2问: 技术栈（12选项 + Other）
  │   ├─ 第3问: 协作模式 + UI审查
  │   ├─ 第4问: 确认摘要
  │   └─ → 跳到阶段 5 生成
  │
  └─ 存量项目（有文件）→ 阶段 1
      ├─ 阶段 1.1: 签名文件匹配
      │   ├─ 匹配成功 → 阶段 1.2 深度扫描 → 阶段 2 填清单
      │   └─ 匹配失败 → 非标存量项目
      │       ├─ 有源码文件 → 按扩展名推断语言 → 阶段 3 补充提问
      │       └─ 无源码文件 → 回退阶段 1B
      │
      ├─ 阶段 2: 填写 40 项清单（~35 项自动，~5 项 [需询问]）
      ├─ 阶段 3: AskUserQuestion 只问 [需询问] 项（2-4 个问题）
      ├─ 阶段 4: 展示完整清单 → 用户确认
      └─ 阶段 5: 生成全部 39 个文件
```

## 附录 B：构建命令自动推断

| 构建工具    | 构建命令                              | 测试命令                | Lint 命令             |
| ------- | --------------------------------- | ------------------- | ------------------- |
| Gradle  | `./gradlew assembleDebug`         | `./gradlew test`    | `./gradlew lint`    |
| npm     | `npm run build`                   | `npm test`          | `npm run lint`      |
| yarn    | `yarn build`                      | `yarn test`         | `yarn lint`         |
| pnpm    | `pnpm build`                      | `pnpm test`         | `pnpm lint`         |
| Cargo   | `cargo build`                     | `cargo test`        | `cargo clippy`      |
| Go      | `go build ./...`                  | `go test ./...`     | `golangci-lint run` |
| pip     | `python -m pytest`                | `python -m pytest`  | `flake8` / `ruff`   |
| poetry  | `poetry run pytest`               | `poetry run pytest` | `poetry run ruff`   |
| Flutter | `flutter build`                   | `flutter test`      | `flutter analyze`   |
| Xcode   | `xcodebuild -scheme <name> build` | `xcodebuild test`   | —                   |

