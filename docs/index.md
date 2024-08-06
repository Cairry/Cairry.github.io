# 功能介绍

## 概要

WatchAlert 是基于Go+React开发的监控告警管理平台。可以完全替代 `AlertManager`、`PrometheusAlert(通知平台)` 等组件，支持配置交互式通知、通知对象、值班系统和聚合功能，并且拥有规则管理、告警抑制、告警推送和告警静默能力。可以提升运维效率，降低维护成本。

## 官网

- Github
  - 后端：[https://github.com/w8t-io/WatchAlert](https://github.com/w8t-io/WatchAlert)
  - 前端：[https://github.com/w8t-io/WatchAlert-web](https://github.com/w8t-io/WatchAlert-web)

## 技术栈

- Go ([https://go.dev](https://go.dev)) Build simple, secure, scalable systems with Go
- MySQL ([https://www.mysql.com](https://www.mysql.com)) 全球广受欢迎的开源数据库
- Gorm ([http://gorm.io](http://gorm.io)) 最好用的 Go 语言数据库 ORM 框架
- React （[https://vuejs.org](https://vuejs.org)）一個自由及開放原始碼的前端JavaScript工具庫

## 功能介绍
告警管理
- 告警规则：支持多数据源和分组通知，用户可以灵活定义告警规则，满足不同的监控需求。    
- 告警抑制：具备告警抑制功能，可以根据当前告警配置的规则进行告警静默，减少不必要的告警干扰。    
- 告警推送：支持多种通知类型，包括飞书（支持官方高级消息卡片Json）、钉钉、企业微信、Email邮件等，用户可以配置实际通知模板，实现告警信息的即时推送。
- 当前告警与历史告警查询：用户可以查询当前时间触发的告警列表以及已恢复的历史告警信息。

规则模版与通知模板
- 规则模版：内置一些常用的告警规则配置，方便用户快速部署和使用。    
- 通知模板：提供默认告警模板，并支持创建、更新、删除等基本操作，用户可以根据实际需求进行自定义。

值班日程
- 安排指定成员在特定日期和时间段内处理告警，有效管理告警并提高工作效率。

多租户支持
- 允许多个组织共享相同的应用程序实例，同时保持各自数据的隔离性和安全性。
- 支持针对不同用户设置不同租户的权限。

数据源支持
- 支持Prometheus、阿里云SLS、Loki、Jaeger、AWS CloudWatch、KubernetesEvent等多种数据源，满足用户多样化的监控需求。

日志审计
- 操作行为记录：记录重要的操作行为，便于后续审计和追溯。

用户管理和角色管理
- 包括基本操作和角色绑定，用于管理系统用户，并通过权限授权实现用户访问控制。

其他功能
- Grafana面板对接：支持对接Grafana面板，方便用户进行更直观的数据分析和监控。

## 交流群/联系我

> 加我入群。

![WeChat](/public/images/wechat.jpg)

## 问题反馈
::: tip
欢迎各位同学来这篇文档进行补充你遇到的问题，以及解决方案
:::
- 反馈/建议: [https://support.qq.com/products/650037](https://support.qq.com/products/650037)

