# Kubernetes 集群组件监控/告警
## kubelet
### `rest_client_requests_total`
- 指标类型
  - Counter（计数器）：这是一个递增的计数器，表示从组件启动以来对 Kubernetes API 的请求总数。
- 标签（Labels）
  - rest_client_requests_total 包含以下标签：
    - code：HTTP 响应状态码（如 200、404、500 等）。
    - method：HTTP 请求方法（如 GET、POST、PUT、DELETE 等）。
    - host：请求的目标主机（通常是 Kubernetes API Server 的地址）。
- 用途
  - 用于监控 Kubernetes 组件（如 kubelet、kube-controller-manager、kube-scheduler 等）对 Kubernetes API 的请求频率。它可以帮助你了解 Kubernetes 组件与 API 的交互频率，从而分析系统的负载和性能。
- 示例
  - 查询1分钟内GET请求QPS
    - `increase(rest_client_requests_total{method="GET",instance="cn-beijing"}[1m])`

### `kubelet_runtime_operations_errors_total`
- 指标类型
  - Counter（计数器）：这是一个递增的计数器，表示从 kubelet 启动以来，与容器运行时操作相关的错误总数。
- 用途
  - 用于检测 kubelet 与容器运行时操作相关的错误累积数量。
- 示例
  - 计算每分钟的容器运行时操作错误率
    - `rate(kubelet_runtime_operations_errors_total[1m]) > 0`

### `kubelet_certificate_manager_client_ttl_seconds`
- 指标类型
  - Gauge（仪表盘）：这是一个瞬时值指标，表示当前客户端证书的剩余有效时间（单位：秒）。
- 用途
  - 用于检测 kubelet 客户端证书的剩余有效时间，确保证书在过期前能够及时续期。如果证书到期，可能会导致 kubelet 无法与 Kubernetes API Server 正常通信。
- 示例
  - 剩余有效时间小于7天
    - `kubelet_certificate_manager_client_ttl_seconds < 86400*7`





