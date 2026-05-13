---
title: "iKindle - 围棋智能教学平台"
date: 2026-05-13
draft: false
description: "集成 KataGo 的全栈围棋教学应用，包含 Spring Boot 服务端、Flutter 客户端和管理后台"
---

iKindle 是一个围棋智能教学平台，集成 KataGo AI 引擎，提供实时对弈、AI 分析、复盘教学等功能。

## 技术架构

| 组件 | 技术栈 |
|---|---|
| 服务端 | Spring Boot 3 + Java 21 + PostgreSQL + Redis |
| 客户端 | Flutter（跨平台） |
| AI 引擎 | KataGo（围棋 AI 分析） |
| 部署 | Kubernetes（OrbStack 本地集群） |
| 管理后台 | Node.js + React |

## 项目结构

```
ikindle/
├── server/           # Spring Boot 服务端
├── client/           # Flutter 客户端
├── admin/            # 管理后台（Node.js）
├── katago-gateway/   # KataGo AI 网关
├── k8s/              # Kubernetes 部署配置
└── docs/             # 文档
```

## 环境要求

- **Java**: JDK 21+
- **Node.js**: 20.11.1+ LTS
- **PostgreSQL**: 16.2+
- **Redis**: 7.2.4+
- **KataGo**: v1.16.4（Metal GPU 加速）

> 项目采用 MIT 协议开源，由 Cai Xin Yun 开发。
