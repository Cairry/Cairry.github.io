# Scheduler 监控
Scheduler 是一个核心组件，负责将工作负载（如 Pods）分配到合适的节点（Nodes）上运行。它的核心作用是根据资源需求、节点状态、策略和约束等因素，做出最优的调度决策。

## 核心作用
- 分配 Pods 到节点：将未调度的 Pods 分配到合适的节点上运行。
- 资源管理：根据 Pod 的资源需求（如 CPU、内存）和节点的资源可用性做出调度决策。
- 优化资源利用：通过调度策略（如亲和性、反亲和性、污点容忍等）优化集群资源分配。

## 监控
### 暴露 Metrics 接口
Path: /etc/kubernetes/manifests/
``` 
  - command:
    - kube-scheduler
    - --authentication-kubeconfig=/etc/kubernetes/scheduler.conf
    - --authorization-kubeconfig=/etc/kubernetes/scheduler.conf
    - --bind-address=0.0.0.0            ### 调整此配置
    - --kubeconfig=/etc/kubernetes/scheduler.conf
    - --leader-elect=true
    #- --port=0
    image: registry.aliyuncs.com/google_containers/kube-scheduler:v1.20.4
```
测试
``` 
[root@master01 manifests]# curl -s -k --cert ./client-cert.pem --key ./client-key.pem https://localhost:10259/metrics | head -n 5
# HELP apiserver_audit_event_total [ALPHA] Counter of audit events generated and sent to the audit backend.
# TYPE apiserver_audit_event_total counter
apiserver_audit_event_total 0
# HELP apiserver_audit_requests_rejected_total [ALPHA] Counter of apiserver requests rejected due to an error in audit logging backend.
# TYPE apiserver_audit_requests_rejected_total counter
```

### 创建 SVC
用于 VM 实现 Kubernetes 自动发现
``` 
kind: Service
apiVersion: v1
metadata:
  name: kube-scheduler
  namespace: kube-system
  labels:
    component: kube-scheduler
spec:
  selector:
    component: kube-scheduler
  ports:
  - protocol: TCP
    targetPort: 10259
    port: 10259
```
### 指标收集
``` 
  - job_name: 'kubernetes-scheduler'
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
          ]
        action: keep
        regex: kube-system;kube-scheduler
      - target_label: __address__
        replacement: kube-scheduler.kube-system.svc:10259
```
### 监控指标
| 指标                     | PromQL                                                                                                                                        |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| Pending Pods 数量        | scheduler_pending_pods{job="kubernetes-scheduler"}                                                                                            |
| 调度器尝试抢占总次数            | scheduler_preemption_attempts_total{job="kubernetes-scheduler"} or vector(0)        |
| Scheduler Nodes 缓存数据统计 | scheduler_scheduler_cache_size{job="kubernetes-scheduler",type="nodes"}                                                                       
| Scheduler Pods 缓存数据统计  | scheduler_scheduler_cache_size{job="kubernetes-scheduler",type="pods"}                                                                        
| Scheduler assumed_pods 缓存数据统计  | scheduler_scheduler_cache_size{job="kubernetes-scheduler",type="assumed_pods"}                                                                
| Kube API 请求QPS【2xx】 | sum(rate(rest_client_requests_total{job="kubernetes-scheduler",code=~"2.."}[$interval])) by (method,code)                                     |
| Kube API 请求QPS【非2xx】 | sum(rate(rest_client_requests_total{job="kubernetes-scheduler",code!~"2.."}[$interval])) by (method,code)                                     |
| Kube API 请求时延 | histogram_quantile($quantile, sum(rate(rest_client_request_duration_seconds_bucket{job="kubernetes-scheduler"}[$interval])) by (verb,url,le)) |

### 仪表盘
[Dashboard File](../../Dashboard/scheduler.json)

