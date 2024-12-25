# CoreDNS 监控
CoreDNS 是 Kubernetes 集群中默认的 DNS 服务器，负责为集群中的服务和 Pod 提供域名解析服务。它是 Kubernetes 网络通信的核心组件之一，确保服务之间可以通过名称（如 my-service.my-namespace.svc.cluster.local）进行通信。

## 核心功能
- 服务发现：

  - 为 Kubernetes 中的服务（Service）和 Pod 提供 DNS 解析。

  - 例如，my-service.my-namespace.svc.cluster.local 会被解析为服务的 ClusterIP。

- Pod 域名解析：

  - 支持直接解析 Pod 的 IP 地址。

  - 例如，Pod 的 IP 地址 10.244.0.10 可以被解析为 10-244-0-10.my-namespace.pod.cluster.local。

- DNS 配置：

  - 提供灵活的 DNS 配置选项，支持自定义 DNS 策略和上游 DNS 服务器。

  - 可以通过 ConfigMap 配置 CoreDNS 的行为。

## 监控
### 指标收集
``` 
 - job_name: 'kubernetes-coredns'
    kubernetes_sd_configs:
      - role: endpoints
    scheme: http
    tls_config:
      insecure_skip_verify: true
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
      - source_labels:
          [
            __meta_kubernetes_namespace,
            __meta_kubernetes_service_name,
          ]
        action: keep
        regex: kube-system;kube-dns
```

### 仪表盘
[Dashboard File](../../Dashboard/coredns.json)