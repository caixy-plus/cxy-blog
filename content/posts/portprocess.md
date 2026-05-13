---
title: "PortProcess - 跨平台端口管理工具"
date: 2026-05-13
draft: false
description: "基于 Flutter 构建的跨平台端口管理工具，支持 macOS、Windows 和 Linux"
---

PortProcess 是一款基于 Flutter 构建的跨平台端口管理工具，支持 macOS、Windows 和 Linux。

## 功能特性

- **实时进程监控** - 自动列出所有绑定端口的本地进程
- **智能搜索** - 按端口号、PID 或进程名过滤进程
- **一键终止** - 单击终止进程（带确认提示）
- **原生系统集成** - UI 颜色与系统主题色无缝融合
- **自动刷新** - 进程列表每 5 秒自动刷新
- **自定义标题栏** - 所有平台统一的现代窗口样式

## 支持平台

| 平台 | 文件格式 |
|---|---|
| macOS (Universal) | `.dmg` |
| Windows (x86_64) | `.msi` |
| Linux (x86_64) | `.tar.gz` |

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/caixy-plus/PortProcess.git
cd PortProcess

# 安装依赖
flutter pub get

# 运行应用
flutter run
```

## 技术架构

```
lib/
├── main.dart                 # 应用入口
├── models/
│   └── process_info.dart     # 进程数据模型
├── services/
│   └── process_service.dart  # 平台特定的进程获取
└── screens/
    └── home_screen.dart      # 主界面
```

### 各平台支持的命令

| 平台 | 列出端口 | 终止进程 |
|---|---|---|
| macOS | `lsof` | `kill -9` |
| Linux | `ss` / `netstat` | `kill -9` |
| Windows | `netstat` | `taskkill` |

## 自动发布

推送版本标签即可触发 GitHub Actions 自动构建：

```bash
git tag v1.0.0
git push origin v1.0.0
```

> 项目采用 MIT 协议开源，由 Cai Xin Yun 开发。
