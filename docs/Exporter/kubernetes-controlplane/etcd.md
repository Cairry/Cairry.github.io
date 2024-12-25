# Etcd 监控
etcd 是一个分布式键值存储系统，广泛用于 Kubernetes 集群中，作为集群的核心数据存储组件。它负责存储 Kubernetes 的所有配置数据、状态信息和元数据。

## 核心作用
- 存储集群配置:

    Kubernetes 的配置数据，例如 API 资源定义、RBAC 规则、网络策略等。如：Pod 的定义和状态。

- 存储集群状态:

    集群中所有对象的状态信息，例如 Pod、Service、Deployment、ConfigMap、Secret 等。如：Service 的 IP 和端口信息。

- 存储元数据:

    集群的元数据，例如节点信息、资源配额、命名空间等。如：Deployment 的副本数和滚动更新状态。

## 监控
### 开启 Metrics 接口
etcd服务默认是有指标收集能力，但是没有对外暴露，需要修改配置。
``` 
  - command:
    - etcd
    - --advertise-client-urls=https://192.168.1.176:2379
    - --cert-file=/etc/kubernetes/pki/etcd/server.crt
    - --client-cert-auth=true
    ...
    - --trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt
    - --listen-metrics-urls=http://0.0.0.0:2381         ### 添加此配置
    image: registry.aliyuncs.com/google_containers/etcd:3.4.13-0
```
测试
``` 
[root@master01 manifests]# curl -k -s  localhost:2381/metrics | head -n 5
# HELP etcd_cluster_version Which version is running. 1 for 'cluster_version' label with current cluster version
# TYPE etcd_cluster_version gauge
etcd_cluster_version{cluster_version="3.4"} 1
# HELP etcd_debugging_auth_revision The current revision of auth store.
# TYPE etcd_debugging_auth_revision gauge
```
### 创建 SVC
用于 VM 实现 Kubernetes 自动发现
``` 
kind: Service
apiVersion: v1
metadata:
  name: etcd
  namespace: kube-system
  labels:
    component: etcd
spec:
  selector:
    component: etcd
  ports:
  - name: metrics
    port: 2381
```
### 指标收集
``` 
  - job_name: 'kubernetes-etcd'
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
        regex: kube-system;etcd
```

### 监控指标
| 指标         | PromQL |
|------------|--------|
| 集群节点数      | count(etcd_server_has_leader{job="kubernetes-etcd"}) or vector(0)   |
| Leader 节点数 | count(etcd_server_is_leader{job="kubernetes-etcd"} == 1)    |
| 过去一天切主次数   |  changes(etcd_server_leader_changes_seen_total{job="kubernetes-etcd"}[1d])   |
| 磁盘大小       |etcd_mvcc_db_total_size_in_bytes{job="kubernetes-etcd"}|
| CPU使用量     | cpu_utilization_core{container="etcd"}*1000|
| 内存使用量           |memory_utilization_byte{container="etcd"}|
| backend commit 延迟|histogram_quantile(0.99, sum(rate(etcd_disk_backend_commit_duration_seconds_bucket{job="kubernetes-etcd"}[5m])) by (instance, le))|
| kv总数| etcd_debugging_mvcc_keys_total{job="kubernetes-etcd"}|
| raft proposals 情况 | etcd_server_proposals_committed_total{job="kubernetes-etcd"} - etcd_server_proposals_applied_total{job="kubernetes-etcd"}|

### 仪表盘
[Dashboard File](../../Dashboard/etcd.json)