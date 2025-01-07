# 集群整体监控
包含集群节点、Kubelet。

## 核心作用
- 监控整个集群的基础组件稳定性

## 监控
### 监控组件
- kube-state-metrics
- ApiServer
- Kubelet

### 监控指标
| 指标                       | PromQL                                                                                                                                         |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| 节点数                      | count(kube_node_info{kernel_version!="",node!~"vci.*"})                                                                                        |
| NotReady节点数              | count(kube_node_info{kernel_version!="",node!~"vci.*"})-count(kube_node_status_condition{condition="Ready", status="true",node!~"vci.*"} == 1) | 
| PIDPressure节点数           | count(kube_node_status_condition{status="true",condition="PIDPressure"}==1) or vector(0)                                                       |
| DiskPressure节点数          | count(kube_node_status_condition{status="true",condition="DiskPressure"}==1) or vector(0)                                                      |
| MemoryPressure节点数        | count(kube_node_status_condition{status="true",condition="MemoryPressure"}==1) or vector(0)                                                    |
| NetworkUnavailable节点数    | count(kube_node_status_condition{status="true",condition="NetworkUnavailable"}==1) or vector(0)                                                |
| 集群节点内存使用                 | sum(kube_pod_container_resource_requests{resource="memory"})                                                                                   |
|                          | sum(kube_pod_container_resource_limits{resource="memory"})                                                                                     |
|                          | sum(kube_node_status_capacity{resource="memory",node!~"vci.*"})                                                                                |
|                          | sum(node_memory_MemTotal_bytes{}-node_memory_MemAvailable_bytes{})                                                                             |
| 集群节点 CPU 使用              | sum(kube_pod_container_resource_requests{resource="cpu"})                                                                                      |
|                          | sum(kube_pod_container_resource_requests{resource="cpu"})                                                                                      |
|                          | sum(kube_pod_container_resource_limits{resource="cpu"})                                                                                        |
|                          | sum (irate(node_cpu_seconds_total{mode="user"}[5m]))                                                                                           |
|                          | sum(kube_node_status_capacity{resource="cpu",node!~"vci.*"})                                                                                   |
| 集群资源数据量                  | sort_desc(sum(etcd_object_counts) by(resource,endpoint))                                                                                       |
| Kubelet与容器运行时交互总次数【1m】   | irate(sum(kubelet_runtime_operations_total{}[1m]) by (instance))                                                                               |
| Kubelet与容器运行时交互失败次数【1m】  | irate(sum(kubelet_runtime_operations_errors_total{}[1m]) by (instance))                                                                        |
| 集群操作容器总错误率【1m】 | sum(irate(sum(kubelet_runtime_operations_errors_total{}[1m]) by (instance)) / irate(sum(kubelet_runtime_operations_total{}[1m]) by (instance)))|
|  Kubelet客户端证书的剩余有效时间| sort(sum(kubelet_certificate_manager_client_ttl_seconds{}) by (instance) )|
| Kubelet GET 请求QPS| rate(sum(kubelet_http_requests_total{method="GET"}) by (instance)[1m]) |
| Kubelet POST 请求QPS| rate(sum(kubelet_http_requests_total{method="POST"}) by (instance)[1m]) |

``` 
    - job_name: 'kubernetes-kubelets'
      scheme: https
      tls_config:
        insecure_skip_verify: true
      bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
      kubernetes_sd_configs:
        - role: node
      relabel_configs:
        - action: labelmap
          regex: __meta_kubernetes_node_label_(.+)
        - source_labels: [__meta_kubernetes_node_name]
          regex: (.+)
          target_label: __metrics_path__
          replacement: /api/v1/nodes/${1}/proxy/metrics
        - target_label: __address__
          replacement: kubernetes.default.svc:443
```

### 仪表盘
[Dashboard File](../../Dashboard/kube-cluster.json)