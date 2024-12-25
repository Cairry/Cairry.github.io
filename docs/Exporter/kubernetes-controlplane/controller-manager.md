# ControllerManager 监控
Controller Manager 是 Kubernetes 的“大脑”，负责通过运行多个控制器来管理和维护集群的状态。

## 核心作用
- 管理控制器：运行多个控制器，确保集群的实际状态与用户定义的期望状态一致。

- 自动化管理：自动处理资源副本、故障恢复、滚动更新等任务。

## 监控
### 暴露 Metrics 接口
Path: /etc/kubernetes/manifests/
``` 
  - command:
    - kube-controller-manager
    - --allocate-node-cidrs=true
    - --authentication-kubeconfig=/etc/kubernetes/controller-manager.conf
    - --authorization-kubeconfig=/etc/kubernetes/controller-manager.conf
    - --bind-address=0.0.0.0            ### 调整此配置
    ...
    - --use-service-account-credentials=true
    image: registry.aliyuncs.com/google_containers/kube-controller-manager:v1.20.4
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
  name: kube-controller-manager
  namespace: kube-system
  labels:
    component: kube-controller-manager
spec:
  selector:
    component: kube-controller-manager
  ports:
  - protocol: TCP
    targetPort: 10257
    port: 10257
```
### 指标收集
``` 
  - job_name: 'kubernetes-controller-manager'
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
        regex: kube-system;kube-controller-manager
      - target_label: __address__
        replacement: kube-controller-manager.kube-system.svc:10257
```
### 监控指标
| 指标                   | PromQL                                                                                                                                  |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| Workqueue入队速率        | sum(rate(workqueue_adds_total{job="kubernetes-controller-manager"}[$interval])) by (name)                                               |
| Workqueue深度          | sum(rate(workqueue_depth{job="kubernetes-controller-manager"}[$interval])) by (name)                                                    | 
| Workqueue处理时延        | histogram_quantile($quantile, sum(rate(workqueue_queue_duration_seconds_bucket{job="ack-cloud-controller-manager"}[5m])) by (name, le)) |
| Kube API 请求QPS【2xx】  | sum(rate(rest_client_requests_total{job="kubernetes-controller-manager",code=~"2.."}[$interval])) by (method,code)                      |
| Kube API 请求QPS【非2xx】 | sum(rate(rest_client_requests_total{job="kubernetes-controller-manager",code!~"2.."}[$interval])) by (method,code)|
 
## 仪表盘
[Dashboard File](../../Dashboard/controller-manager.json)
