---
title: "cc-gateway - 多平台远程驱动智能体 CLI 的网关"
date: 2026-05-16
lastmod: 2026-06-05
draft: false
description: "用飞书/Telegram/QQ/WebUI 远程驱动本地多种智能体 CLI（Claude Code、Cursor、Pi、OpenCode）的 Rust 网关工具"
---

**项目地址**: [https://github.com/caixy-plus/cc-gateway](https://github.com/caixy-plus/cc-gateway)

cc-gateway 是一个用 Rust 编写的网关工具，让你通过 **飞书/Lark、Telegram、QQ** 聊天机器人或浏览器 **WebUI**，远程驱动运行在本机上的多种智能体 CLI —— Claude Code、Cursor、Pi、OpenCode 等。

> **本次大更新**：从最初"飞书 + 本地 CLI 控制 Claude"，进化为 **多平台接入 + 多智能体可插拔** 的网关，并新增聊天隔离、配对放行与 WebUI 仪表盘。

## 功能特性

- **远程控制**: 用手机上的聊天机器人操作本机智能体
- **多平台**: 飞书/Lark、Telegram、QQ 官方机器人，可同时启用任意组合
- **多智能体**: 可插拔后端（`claude`、`cursor`、`pi`、`opencode` 等），用 `/agents` 按聊天指定默认智能体
- **聊天隔离**: 每个聊天/频道独立子进程，消息互不串线
- **配对放行**: 可在 WebUI 中批准新聊天后再允许使用（建议开启）
- **WebUI**: 浏览器管理会话、配对、设置与实时事件
- **目录工具**: `/ll`（飞书为交互卡片，Telegram/QQ/WebUI 为文本列表）
- **守护进程**: `start` / `stop` / `restart` / `log`，端口绑定保证单实例

## 架构设计

```
用户 (飞书/Lark)  <-->  cc-gateway 守护进程  <-->  本地智能体 CLI
用户 (Telegram)   <-->  cc-gateway 守护进程  <-->  claude / cursor / pi / …
用户 (QQ)         <-->  cc-gateway 守护进程
用户 (WebUI)      <-->  cc-gateway 守护进程
```

网关以子进程方式拉起各 provider CLI，并桥接聊天消息。不同智能体使用各自的通信协议：

| 智能体 | 协议 |
|---|---|
| Claude Code | stream-json（stdio） |
| Cursor / OpenCode | ACP |
| Pi | JSON-RPC |

## 快速开始

### 安装

**macOS / Linux**

```bash
curl -fsSL https://raw.githubusercontent.com/caixy-plus/cc-gateway/main/install.sh | sh
```

安装过程会执行 `cc-gateway init`、重启守护进程，并输出文档链接。

**Windows**

```powershell
irm https://raw.githubusercontent.com/caixy-plus/cc-gateway/main/scripts/install-irm.ps1 | iex
```

**从源码构建**

```bash
git clone https://github.com/caixy-plus/cc-gateway.git
cd cc-gateway
./install_local.sh    # macOS/Linux：构建 WebUI 并安装到 ~/.local/bin
# Windows: .\install_local.ps1
```

### 初始化配置

```bash
cc-gateway init
```

也可在 `cc-gateway start` 后通过 WebUI **设置** 或编辑 `~/.cc-gateway/config.json`。按需启用机器人：

| 平台 | 配置项 |
|---|---|
| 飞书 / Lark | `feishu.enabled`、`app_id`、`app_secret` |
| Telegram | `telegram.enabled`、`bot_token` |
| QQ | `qq.enabled`、`app_id`、`app_secret`、`sandbox` |

将 `default_dir` 设为远程用户可浏览的工作区根目录（如 `~/Workspace`）。多个平台可同时运行。

### 启动与使用

```bash
cc-gateway start        # 启动守护进程
cc-gateway webui        # 打开 WebUI（配对、设置、会话）
cc-gateway stop         # 停止
```

配对后，在 WebUI 输入框或飞书/Telegram/QQ 中用 `/agent` 即可开始对话。

## 命令参考

### CLI 命令

| 命令 | 说明 |
|---|---|
| `cc-gateway` | 显示帮助（同 `--help`） |
| `cc-gateway init` | 交互式配置向导（含可选机器人凭证） |
| `cc-gateway start` / `stop` / `restart` | 启停/重启守护进程 |
| `cc-gateway status` | 查看守护进程状态 |
| `cc-gateway log [-f] [-n 100]` | 查看日志（`-f` 跟踪） |
| `cc-gateway webui` | 在浏览器打开 WebUI（未运行时会先 start） |
| `cc-gateway webui-token [--refresh]` | 查看或重新生成 WebUI 访问令牌 |
| `cc-gateway enable` / `disable` | 开关开机自启（launchd / systemd 用户服务） |
| `cc-gateway update [-y]` | 检查并安装最新发布版 |
| `cc-gateway uninstall` | 卸载二进制与服务项 |

### 网关命令（聊天内）

在 WebUI 及已接入的机器人中可用（若开启配对须先放行）：

| 命令 | 说明 |
|---|---|
| `/help` | 显示命令列表 |
| `/quit` | 结束当前智能体会话 |
| `/cd <路径>` | 更改工作目录 |
| `/cd_default` | 恢复为 `default_dir` |
| `/agent [provider] [参数...]` | 启动或重启智能体会话 |
| `/agents [provider]` | 设置本频道默认智能体 |
| `/agent-history [n]` | 列出最近会话；按序号恢复 |
| `/pwd` | 显示当前工作目录 |
| `/ll` | 选择目录（飞书卡片 / 文本列表） |
| `/mkdir <名称>` | 创建目录 |
| `/show-thinking` / `/hide-thinking` | 开关 Thinking 输出 |
| `/stop` / `/clear` / `/status` / `/esc` | 控制当前生成（视平台支持） |

> 执行 `/agent` 后，普通文本会转发给智能体；网关命令仍可使用。`/quit` 结束当前会话。

## 技术栈

| 组件 | 技术 |
|---|---|
| 语言 | Rust 2021 Edition |
| 异步运行时 | Tokio |
| CLI 框架 | Clap v4 |
| HTTP / WebSocket | Reqwest（rustls） / Tokio-Tungstenite |
| 序列化 | Serde + Prost（protobuf） |
| 持久化 | SQLite（rusqlite，内置打包） |
| 并发状态 | DashMap（聊天隔离） |
| 可插拔后端 | async-trait |
| 日志 | Tracing |

## 飞书配置

1. 前往[飞书开放平台](https://open.feishu.cn)创建应用
2. 启用"机器人"能力
3. 添加 `im.message.receive_v1` 事件，选择 WebSocket 长连接模式
4. 将 `app_id` 和 `app_secret` 复制到配置文件中
5. 将应用安装到工作区

> 更多机器人（Telegram / QQ）与配置细节见仓库 `docs/` 下的中英双语文档。项目采用 MIT 协议开源，由 Cai Xin Yun 开发。
