---
title: "SuperAsync - 通用异步任务调度平台"
date: 2026-05-13
draft: false
description: "高吞吐、低延迟、可水平扩展的分布式任务调度与执行框架，基于 PostgreSQL + Spring Boot"
---

> 通用异步任务调度平台 —— 高吞吐、低延迟、可水平扩展的分布式任务调度与执行框架。

## 项目介绍

SuperAsync 是一个面向生产环境的通用异步任务调度平台，支持两种执行模式：

- **Server 本地模式**：调度器与执行器同进程，适合单机高吞吐场景。
- **Worker 远程模式**：调度器通过 HTTP 向独立 Worker 分发任务，支持水平扩展。

核心特性：

- **PostgreSQL + FOR UPDATE SKIP LOCKED**：原生支持高并发任务抢占，无需额外消息队列。
- **任务优先级 + 延迟调度**：支持优先级队列与精确到毫秒的延迟执行。
- **自动重试 + 超时监控**：失败自动退避重试，超时任务自动回滚。
- **定时任务（Cron）**：内置 Cron 表达式解析，支持秒级精度。
- **工作流引擎（DAG）**：支持基于 DAG 的复杂任务编排（Beta）。
- **Spring Boot 自动装配**：一行配置即可接入现有项目。

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      SuperAsync Server                       │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │ Task Submit │──▶│  PostgreSQL  │◀──│ Task Polling     │  │
│  │  REST API   │   │  async_tasks │   │ Scheduler(5s)   │  │
│  └─────────────┘   └──────────────┘   └─────────────────┘  │
│         │                   ▲                    │           │
│         │                   │                    ▼           │
│         │            ┌──────────────┐      ┌──────────┐     │
│         │            │ ScheduledJob │      │ Executor │     │
│         │            │   Engine     │      │  Engine  │     │
│         │            └──────────────┘      └──────────┘     │
│         │                                            │       │
│  ┌──────▼────────────────────────────────────────────▼───┐  │
│  │              REST API: /v1/worker/poll                │  │
│  │              REST API: /v1/worker/complete            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTP
┌─────────────────────────────────────────────────────────────┐
│                    SuperAsync Worker (SDK)                   │
│  ┌──────────────┐   ┌─────────────────┐   ┌─────────────┐  │
│  │  Poll Loop   │──▶│  SuperAsyncWorker │──▶│  Handler    │  │
│  │  (3s/100ms)  │   │    Registry       │   │ @SuperAsync │  │
│  └──────────────┘   └─────────────────┘   └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 调度流程

1. 客户端通过 `TaskDispatcher.submit()` 将任务写入 `async_tasks` 表（状态 `PENDING`）。
2. **本地模式**：`TaskPollingScheduler` 定期轮询 `PENDING` 任务（默认 5s，可配置），调用 `TaskExecutorEngine` 在线程池中执行。任务提交后会**即时触发一次轮询**，消除等待延迟。
3. **Worker 模式**：`SuperAsyncWorkerEngine` 定期 HTTP 轮询 `/v1/worker/poll`，抢到任务后在本机线程池执行，结果通过 `/v1/worker/complete` 回写。支持**批量抢锁**（一次 HTTP 拉取多条任务）。
4. **定时任务**：`JobSchedulerEngine` 定期扫描 `scheduled_jobs` 表（默认 10s，可配置），触达时间的任务会生成对应的 `async_task`。

## 快速开始

### 1. 环境准备

- Java 21+
- Maven 3.8+
- PostgreSQL 14+（本地测试可用 Docker 一键启动）

```bash
# 启动 PostgreSQL
docker run -d --name superasync-pg \
  -e POSTGRES_DB=superasync \
  -e POSTGRES_USER=superasync \
  -e POSTGRES_PASSWORD=superasync \
  -p 5432:5432 postgres:16-alpine
```

### 2. 编译安装

```bash
git clone https://github.com/caixy-plus/super-async.git
cd super-async
mvn clean install -DskipTests
```

### 3. 启动 Server

```bash
cd super-async-server
mvn spring-boot:run
```

Server 默认启动在 `http://localhost:8080`，自动执行 Flyway 迁移创建表结构。

### 4. 运行性能测试

```bash
cd super-async-benchmark
mvn spring-boot:run
```

测试完成后会在控制台输出 Markdown 格式的性能报告。

## 接入指南

### Server 本地模式

在业务服务中引入 `super-async-server`，通过 `@TaskHandler` 注解注册本地执行器：

```java
import com.superasync.annotation.TaskHandler;
import com.superasync.dto.TaskContext;
import com.superasync.dto.TaskResult;
import org.springframework.stereotype.Component;

@Component
public class OrderTaskHandler {

    @TaskHandler("ORDER_PAYMENT")
    public TaskResult handlePayment(TaskContext ctx) {
        String orderId = ctx.getPayload();
        // 执行业务逻辑
        return TaskResult.ok("paid");
    }
}
```

提交任务：

```java
import com.superasync.dto.TaskRequest;
import com.superasync.dto.Priority;
import com.superasync.service.TaskDispatcher;

@Service
public class OrderService {
    @Autowired
    private TaskDispatcher taskDispatcher;

    public void createOrder(String orderId) {
        TaskRequest request = TaskRequest.builder()
                .taskType("ORDER_PAYMENT")
                .taskKey("order_" + orderId)
                .payload(orderId)
                .priority(Priority.HIGH)
                .delay(Duration.ofSeconds(30))   // 30s 后执行
                .timeout(Duration.ofMinutes(5))
                .maxRetry(3)
                .build();
        taskDispatcher.submit(request);
    }
}
```

### Worker 远程模式

在独立 Worker 服务中引入 `super-async-sdk`：

**1. 配置 `application.yml`：**

```yaml
superasync:
  worker:
    enabled: true
    worker-id: worker-node-1
    server-url: http://localhost:8080
    core-pool-size: 16
    poll-interval-ms: 3000
    tags:
      - PAYMENT_WORKER
```

**2. 编写 Worker 处理器：**

```java
import com.superasync.dto.TaskContext;
import com.superasync.dto.TaskResult;
import com.superasync.worker.annotation.SuperAsyncWorker;
import org.springframework.stereotype.Component;

@Component
public class PaymentWorker {

    @SuperAsyncWorker("ORDER_PAYMENT")
    public TaskResult handle(TaskContext ctx) {
        // 执行业务逻辑
        return TaskResult.ok("done");
    }
}
```

**3. 提交时指定 workerTag：**

```java
TaskRequest request = TaskRequest.builder()
        .taskType("ORDER_PAYMENT")
        .taskKey("order_" + orderId)
        .payload(orderId)
        .workerTag("PAYMENT_WORKER")   // 指定由该标签的 Worker 执行
        .build();
taskDispatcher.submit(request);
```

## 性能测试报告

> 测试环境：MacBook Pro (Apple Silicon, 8C), Java 21, PostgreSQL 16 (Docker)

### 测试结果

#### 简单任务延迟测试 (Worker模式-手动驱动)

| 指标 | 数值 |
|---|---|
| 平均延迟 | **253.00 ms** |
| P50 延迟 | **245 ms** |
| P95 延迟 | **434 ms** |
| P99 延迟 | **489 ms** |

#### 简单任务吞吐量测试 (本地模式-手动驱动)

| 指标 | 数值 |
|---|---|
| 平均延迟 | **34.30 ms** |
| P50 延迟 | **33 ms** |
| P95 延迟 | **54 ms** |
| P99 延迟 | **76 ms** |
| 吞吐量 | **3937 tasks/s** |

#### 万级任务吞吐量测试 (本地模式-手动驱动)

| 指标 | 数值 |
|---|---|
| 提交任务数 | 10,000 |
| 完成任务数 | 10,000 |
| 失败任务数 | 0 |
| 总耗时 | **1.93 s** |
| 吞吐量 | **5186.72 tasks/s** |
| 平均延迟 | 348.42 ms |
| P50 延迟 | 376 ms |
| P95 延迟 | 483 ms |
| P99 延迟 | 493 ms |
| 最大延迟 | 702 ms |

### 结果分析

- **本地模式延迟**：通过**即时调度（eager poll）**，任务提交后毫秒级触发 `pollAndDispatch`，P50 达到 **33ms**，具备百毫秒级调度能力。
- **Worker 模式延迟**：通过**批量抢锁**（一次 HTTP 拉取 10 条任务），HTTP 往返次数减少 90%，P50 达到 **245ms**。
- **万级吞吐**：1 分钟内提交 10,000 条任务，系统在 **1.93 秒**内全部完成，峰值吞吐达 **5186 tasks/s**，零失败。

## 模块说明

```
super-async/
├── super-async-sdk/          # 客户端 SDK + Worker 运行时
│   ├── SuperAsyncClient       # HTTP 客户端（提交任务、注册定时任务）
│   ├── SuperAsyncWorkerEngine # Worker 轮询与执行引擎
│   └── @SuperAsyncWorker      # Worker 处理器注解
├── super-async-server/       # 调度服务端
│   ├── TaskPollingScheduler   # 本地任务轮询调度器
│   ├── TaskExecutorEngine     # 本地任务执行引擎
│   ├── JobSchedulerEngine     # 定时任务调度引擎
│   ├── WorkflowEngine         # DAG 工作流引擎
│   └── REST API               # 任务管理 + Worker 通信接口
└── super-async-benchmark/    # 性能测试与接入示例
    ├── BenchmarkOrchestrator  # 多场景测试编排器
    ├── BenchmarkTaskController# 双模式任务处理器示例
    └── BenchmarkReport        # 性能指标与报告生成
```

## 开源协议

本项目基于 [Apache License 2.0](LICENSE) 开源。

> **注意**：SuperAsync 目前处于积极开发阶段，API 可能在正式 1.0 发布前发生变动。生产环境使用前建议进行充分压测与容错验证。
