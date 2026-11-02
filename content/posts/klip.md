---
title: "Klip - macOS 剪贴板历史管理器，已上架 App Store"
date: 2026-07-24
draft: false
description: "隐私优先的 macOS 菜单栏剪贴板历史管理器：完全离线、零权限，已上架 Mac App Store"
categories: ["技术"]
---

**App Store**: [Klip - 剪贴板历史](https://apps.apple.com/cn/app/klip-%E5%89%AA%E8%B4%B4%E6%9D%BF%E5%8E%86%E5%8F%B2/id6788219271)（macOS 14.0+，免费下载）

Klip 是一款 macOS 菜单栏剪贴板历史管理器。和之前写的开源小工具不同，这是我的第一个**闭源商业产品**，已经在 Mac App Store 上架。

![Klip 历史面板](/images/klip-screenshot-1.png)

## 为什么自己做

市面上的剪贴板工具不少，但大多数要么要辅助功能权限、要么带网络统计 SDK——一个天天经手你复制内容（密码、验证码、私钥）的工具，却要你交出这些信任，总觉得哪里不对。

所以 Klip 的设计目标反过来定：**先把隐私做到极限，再在这个约束内把体验做好**。

## 功能特性

- **⌘K 唤起历史面板** - 屏幕居中的非激活浮层，原应用保持焦点；↑↓ 选择、⏎ 复制、⇧⏎ 纯文本、esc 关闭
- **全文搜索** - SQLite FTS5，支持中文与拼音首字母（输入 `fp` 命中"发票"），1000 条内 < 16ms
- **文本 / 图片 / 文件** - 图片以文件形式存储、面板中显示缩略图；SHA-256 去重
- **固定与保留策略** - 固定条目永不清理；历史按条数或天数自动清理
- **中文 / English 本地化**

![Klip 快速搜索](/images/klip-screenshot-2.png)

## 隐私是核心卖点，不是附加说明

- **完全离线**：没有任何网络库，不发起任何网络请求
- **零权限**：不申请辅助功能、无障碍等任何系统权限
- **本地加密**：数据库使用 SQLCipher 加密，密钥存 Keychain
- **无第三方 SDK**：没有统计、没有崩溃上报、没有追踪

![Klip 首次启动](/images/klip-screenshot-3.png)

## 零权限的代价：复制模式粘贴

这是最有意思的一个设计取舍。绝大多数剪贴板工具靠辅助功能权限模拟 ⌘V 自动粘贴，Klip 不申请这个权限，所以选中条目后只做两件事：写回剪贴板、把焦点还给原应用——**由你自己按 ⌘V 完成粘贴**。

多按一次键，换来应用对系统完全"无特权"。我认为值。

## 免费 + Pro

免费版可用 50 条历史 + 3 个固定条目，核心功能不阉割；**Klip Pro** 为一次性买断（非订阅），解锁无限历史与固定条目。

## 技术栈（给好奇的同行）

Swift 6（严格并发）+ SwiftUI / AppKit 混合；GRDB.swift（SQLite + FTS5）+ SQLCipher；StoreKit 2 内购；KeyboardShortcuts 全局热键。仅 SPM，无 CocoaPods。面板用 `.nonactivatingPanel` 实现不抢焦点的浮层，剪贴板监听走 `changeCount` 轮询，搜索索引在插入时生成拼音首字母列。

---

欢迎到 [App Store](https://apps.apple.com/cn/app/klip-%E5%89%AA%E8%B4%B4%E6%9D%BF%E5%8E%86%E5%8F%B2/id6788219271) 下载试用，有问题可以在评论区反馈。
