# ApiServer 监控
ApiServer 是 Kubernetes 集群的核心组件之一，负责处理所有与 Kubernetes API 的交互。它是 Kubernetes 控制平面的入口点，提供了一个 RESTful API 接口，用于管理集群中的资源（如 Pod、Service、Deployment 等）。

## 核心功能
- API 入口：

  - ApiServer 是 Kubernetes 集群的唯一入口，所有对集群的操作（如创建、更新、删除资源）都必须通过它。

  - 它提供了一个 RESTful API，允许用户、管理员和自动化工具（如 kubectl）与集群交互。

- 认证与授权：

  - ApiServer 负责对所有请求进行身份验证（Authentication）和授权（Authorization）。

  - 支持多种认证机制（如证书、Token、用户名密码等）和授权策略（如 RBAC、ABAC 等）。

- 资源管理：

  - 管理 Kubernetes 中的所有资源对象（如 Pod、Service、ConfigMap 等）。

  - 提供资源的增删改查（CRUD）操作。

- 存储与状态管理：

  - ApiServer 将所有资源的状态存储在 etcd（Kubernetes 的分布式键值存储）中。

  - 它负责将客户端的请求转换为对 etcd 的操作，并确保数据的一致性和可靠性。

- 事件与审计：

  - 记录集群中的所有操作事件，便于故障排查和审计。

  - 支持审计日志功能，记录谁在何时对哪些资源做了什么操作。

## 监控
### 指标收集
``` 
  - job_name: 'kubernetes-apiserver'
    kubernetes_sd_configs:
      - role: endpoints
    scheme: https
    tls_config:
      insecure_skip_verify: true
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
      - source_labels:
          [
            __meta_kubernetes_namespace,
            __meta_kubernetes_service_name,
            __meta_kubernetes_endpoint_port_name,
          ]
        action: keep
        regex: default;kubernetes;https
      - target_label: __address__
        replacement: kubernetes.default.svc:443
```

### 仪表盘
[Dashboard File](../../Dashboard/apiserver.json)