---
title: "AI 指导棋 (ai-gobang)"
date: 2026-05-13
draft: false
description: "面向围棋爱好者的智能教学应用，集成 KataGo AI 引擎与大模型自然语言教学"
---

AI 指导棋是一款面向围棋爱好者的智能教学应用。核心体验是：**用户与 AI 对弈或自战解说时，获得像人类高段棋手一样的实时指导、赛后复盘和互动问答**。

## 技术亮点

- **KataGo**（v1.16.4，Metal GPU）提供围棋局面分析、胜率、选点、变化图
- **大模型**（脑池 API）将 KataGo 的数值分析翻译为自然语言教学
- **Flutter** 跨平台客户端（macOS / iOS / Android / Windows）
- **Spring Boot** 服务端，部署在本地 K8s（OrbStack）

## 功能规划

| 阶段 | 功能 |
|---|---|
| Phase 1（MVP） | 人机对弈（KataGo 执黑/白）、基础棋盘 UI、落子同步、SGF 导入导出 |
| Phase 2（实时指导） | 对弈中 AI 提示（胜率条、推荐选点、简短评语）、用户主动请求提示 |
| Phase 3（复盘+对话） | 赛后胜率曲线、关键失误/好手标注、自然语言复盘报告、对话式问答 |
| Phase 4（课程） | 死活题/定式题库、AI 出题、作答点评、进度追踪 |

## 项目结构

```
ai-gobang/
├── admin/        # 管理后台
├── backend/      # Spring Boot 服务端
├── mobile/       # 移动端
├── docs/         # 设计文档
├── deploy/       # 部署配置
└── start.sh      # 启动脚本
```

> 项目采用 MIT 协议开源，欢迎 Star 和贡献。
