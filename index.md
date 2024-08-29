---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "WatchAlert"
  text: "智能高效的云原生监控系统！"
  tagline: 基于 Go + React 实现
  image:
    src: /images/logo.png
    alt: WatchAlert
  actions:
    - theme: brand
      text: 快速开始
      link: /docs/
    - theme: alt
      text: 演示环境（admin/123）
      link: http://8.147.234.89/
      
features:
  - title: 多租户
    details: 允许多个组织共享相同的应用程序实例，同时保持各自数据的隔离性和安全性。
  - title: 云原生
    details: 支持接入Prometheus、VictoriaMetrics、CloudWatch、Loki、Jaeger、AliCloud SLS、KubernetesEvent、ElasticSearch等多种数据源；
  - title: 开箱即用
    details: 支持Docker、Kubernetes、二进制等多种部署方式，内置常见中间件告警规则模版；
  - title: 证书监控
    details: 对SSL证书的状态、有效性和安全性进行持续监测的过程。通过证书监控，组织能够及时发现和处理潜在的证书问题，如过期证书，确保其网络通信的安全性和可靠性；
  - title: 通知对象
    details: 支持推送告警至Email、飞书、钉钉等平台；
  - title: 值班
    details: 安排指定成员在特定日期和时间段内处理告警，有效管理告警并提高工作效率；
---