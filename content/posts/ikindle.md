---
title: "iKindle - 电子书阅读平台"
date: 2026-05-13
draft: false
description: "全栈电子书阅读平台，支持多端阅读、书架管理、订单支付与数据同步"
---

**项目地址**: [https://github.com/caixy-plus/ikindle](https://github.com/caixy-plus/ikindle)

iKindle 是一个功能完整的电子书阅读平台，支持电子书管理、多端阅读、书架管理、订单支付与数据同步。

![iKindle 截图](/images/ikindle-screenshot.png)

## 技术架构

| 组件 | 技术栈 |
|---|---|
| 后端 | Java 21 + Spring Boot 3.2.3 + PostgreSQL + Redis + QueryDSL |
| PC 前端 | React 18 + TypeScript + Ant Design |
| 移动端 | Flutter（iOS / Android / macOS / Windows） |
| 管理后台 | Node.js + React |
| 认证 | JWT Token |

## 核心功能

### 书籍管理
- 电子书分类管理（Category）、标签管理（Tag）
- 热门书籍、推荐书籍、最新书籍智能推荐
- 支持关键词搜索、价格区间筛选、分类浏览
- 书籍发布/下架管理（Admin）

### 用户系统
- 用户注册/登录（JWT 认证）
- 个人书架管理（UserBookshelf）
- 阅读进度同步（SyncTask）
- 角色权限管理（Role、Permission、Menu）

### 订单与支付
- 电子书购买订单（Order、OrderItem）
- 账户充值订单（RechargeOrder）
- 账户余额管理（Account、AccountTransaction）
- 支付回调处理

### 管理后台
- 用户管理、书籍管理、订单管理
- 系统配置（SystemConfig）、数据字典（Dict）
- 权限菜单配置

## 项目结构

```
ikindle/
├── backend/              # Spring Boot 后端（:8082）
│   └── com/ikindle/
│       ├── controller/   # REST API（Book, User, Order, Account...）
│       ├── service/      # 业务逻辑层
│       ├── repository/   # JPA + QueryDSL 数据访问
│       ├── entity/       # 实体类（Book, User, Order...）
│       └── dto/          # MapStruct DTO 转换
├── mobile/               # Flutter 多端应用
│   ├── features/         # 功能模块（书籍浏览、阅读器、书架...）
│   ├── shared/           # 共享组件
│   └── core/             # 核心配置（路由、状态管理）
├── admin/                # Node.js 管理后台
└── docs/                 # 部署文档
```

## API 设计

所有 API 以 `/api/` 为前缀，统一返回 `ApiResponse<T>` 格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": 1715587200000
}
```

### 公开接口
- `GET /api/books` — 书籍列表（支持分页、搜索、筛选）
- `GET /api/books/hot` — 热门书籍
- `GET /api/books/recommended` — 推荐书籍
- `GET /api/books/latest` — 最新书籍
- `POST /api/users/register` — 用户注册
- `POST /api/users/login` — 用户登录

### 认证接口
- `GET /api/users/**` — 用户信息管理
- `GET /api/bookshelf/**` — 书架管理
- `POST /api/orders/**` — 订单创建与支付

## 快速开始

### 环境要求
- **Java**: JDK 21+
- **PostgreSQL**: 16.2+（数据库：`ikindle`）
- **Redis**: 7.2.4+
- **Node.js**: 20.11.1+（管理后台）

### 启动后端
```bash
cd ikindle/backend
mvn compile          # 编译并生成 QueryDSL Q 类
mvn spring-boot:run  # 启动后端（:8082）
```

### 启动移动端
```bash
cd ikindle/mobile
flutter pub get
flutter run          # 运行 Flutter 应用
```

## 测试账号

系统启动后自动种子数据：
- **管理员**: admin / admin123
- **普通用户**: test / test123

## 技术亮点

- **QueryDSL**: 类型安全的动态查询，避免 SQL 拼接
- **MapStruct**: 编译期 DTO/Entity 转换，零反射开销
- **统一响应**: `ApiResponse<T>` 包装所有 API 返回
- **JWT 认证**: 无状态认证，支持移动端和 Web 端
- **多端同步**: SyncTask 实现阅读进度跨设备同步
- **权限控制**: `@PreAuthorize` 注解实现方法级权限校验

> 项目采用 MIT 协议开源，由 Cai Xin Yun 开发。
