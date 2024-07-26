# MongoDB 资源监控

**前置条件**
- 环境中存在MongoDB服务
- 授权监控用户
``` 
use admin
db.createUser({ user: 'exporter',pwd : 'exporter_2024',roles:[{role: 'readAnyDatabase',db: 'admin'},{role: 'clusterMonitor',db: 'admin'}]})

# 验证可用性
> db.auth("exporter","exporter_2024")
1
```

## 监控范围
- 节点状态
  - `mongodb_mongod_replset_member_health`：监控 MongoDB 副本集节点的健康状态。用于检测 MongoDB 副本集的各个节点是否正常运行，帮助识别潜在的节点故障。
  - `mongodb_mongod_replset_number_of_members`：MongoDB 副本集中成员的总数量。用于监控副本集的规模和成员状态，确保所有预期的成员都在运行。
- 资源使用率
  - `mongodb_memory`：MongoDB 使用的内存量。用于监控 MongoDB 的内存使用情况，帮助优化内存分配。
  - `irate(mongodb_connections[5m])`：计算 MongoDB 每 5 分钟的连接速率变化。用于监控连接增长速率，帮助识别连接泄漏或过高的连接负载问题。
  - `irate(mongodb_op_counters_total[5m])`计算 MongoDB 每 5 分钟的操作计数速率。用于监控 MongoDB 的操作负载，包括读取、写入、更新等操作，帮助识别负载瓶颈。
  - `irate(mongodb_network_bytes_total[5m])`：计算 MongoDB 每 5 分钟的网络流量字节速率。用于监控网络带宽使用情况，帮助识别可能的网络拥塞问题。
- TTL
  - `rate(mongodb_mongod_metrics_ttl_deleted_documents_total[5m])`：计算 MongoDB 每 5 分钟的 TTL 删除文档速率。 用于监控 TTL 机制删除过期文档的速率，确保 TTL 功能正常运行。
  - `rate(mongodb_mongod_metrics_ttl_passes_total[5m])`：计算 MongoDB 每 5 分钟的 TTL 执行遍历次数速率。用于监控 TTL 进程的运行频率，帮助优化 TTL 机制的执行效率。

## 部署Exporter
``` 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb-exporter
  namespace: monitoring
  labels:
    app: mongodb-exporter
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb-exporter
  template:
    metadata:
      labels:
        app: mongodb-exporter
    spec:
      containers:
        - name: mongodb-exporter
          image: registry.js.design/bitnami/mongodb-exporter:0.11.2-debian-10-r389
          env:
            - name: MONGODB_URI
              value: "mongodb://exporter:exporter_2024@mongodb-ali-prod-headless:27017/admin?ssl=false"
          ports:
            - containerPort: 9216
              name: metrics

---
apiVersion: v1
kind: Service
metadata:
  name: mongodb-exporter
  namespace: monitoring
  labels:
    app: mongodb-exporter
spec:
  ports:
    - port: 9216
      targetPort: 9216
      protocol: TCP
      name: metrics
  selector:
    app: mongodb-exporter
  type: ClusterIP 

```

## Prometheus 端点配置
``` 
  - job_name: "MongoDB"
    scheme: http
    static_configs:
    - targets: ["mongodb-exporter.monitoring:9216"]
```

## 监控大盘

[Dashboard JSON](../Dashboard/mongo.json)

![img.png](img/mongo-img.png)
![img_1.png](img/mongo-img_1.png)