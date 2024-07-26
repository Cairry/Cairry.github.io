# Redis 资源监控

**前置条件**
- 环境中已部署Redis，版本推荐2.x, 3.x, 4.x, 5.x, 6.x, and 7.x；
- 具备exporter可用的账号密码；

## 监控范围
- 连接数
  - `sum(redis_connected_clients)`：连接到 Redis 服务器的客户端总数。用于监控当前有多少客户端连接到 Redis，帮助识别连接数是否达到 Redis 的限制。
  - `sum(redis_blocked_clients)`：被阻塞的 Redis 客户端总数。用于识别因为阻塞操作（如 BLPOP 等阻塞命令）而等待响应的客户端数量。
- 资源使用率
  - `redis_memory_used_bytes`：Redis 当前使用的内存字节数。帮助监控 Redis 的内存使用情况，识别是否需要优化数据结构或增加内存。
  - `redis_memory_max_bytes`：Redis 配置的最大可用内存字节数。确保 Redis 使用的内存不超过配置的上限，以防止 OOM（内存溢出）错误。
  - `sum(rate(redis_net_input_bytes_total[5m]))`：Redis 网络输入流量的速率（5分钟内字节总数）。用于监控 Redis 接收的数据量，帮助识别网络流量模式和潜在的瓶颈。
  - `sum(rate(redis_net_output_bytes_total[5m]))`：Redis 网络输出流量的速率（5分钟内字节总数）。用于监控 Redis 发送的数据量，帮助识别流量模式和网络性能问题。
- 命中率
  - `irate(redis_keyspace_hits_total[5m])`：每秒缓存命中的速率（5分钟内）。监控 Redis 的命中率，判断缓存的有效性和效率。
  - `irate(redis_keyspace_misses_total[5m])`：每秒缓存未命中的速率（5分钟内）。识别缓存未命中情况，帮助优化缓存策略和数据访问模式。
  - `sum (redis_db_keys) by (instance) - sum (redis_db_keys_expiring) by (instance)`：非过期键的数量。监控非过期键的数量，了解 Redis 中存储的数据规模。
  - `sum (redis_db_keys_expiring) by (instance)`：设置了过期时间的键的数量。了解有多少数据设置了 TTL（过期时间），帮助管理数据生命周期。
- 命令
  - `sum(rate(redis_commands_total [1m])) by (cmd)`：每种命令每秒的执行次数。帮助分析不同 Redis 命令的使用频率，识别热点命令和优化性能。
  - `sum(irate(redis_commands_duration_seconds_total[1m])) by (cmd) != 0`：每种命令的平均执行时长。识别执行时间较长的命令，帮助优化 Redis 操作和性能。
  - `sum(irate(redis_commands_duration_seconds_total[1m])) by (cmd)
    /
    sum(irate(redis_commands_total[1m])) by (cmd)
    `：每种命令的平均执行时间（秒）。帮助识别耗时的命令，优化 Redis 命令的执行效率。
- 数据库项目数
  - `sum (redis_db_keys) by (db, instance)`：每个 Redis 数据库中的键的数量。监控每个数据库中的数据规模，帮助进行容量规划和性能优化。

## 部署Exporter
``` 
apiVersion: apps/v1kind: Deployment
metadata:
  labels:
    app: redis-exporter
  name: redis-exporter
  namespace: monitor
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis-exporter
  template:
    metadata:
      labels:
        app: redis-exporter
    spec:
      containers:
      - name: redis-exporter
        image: registry.js.design/prometheus/redis_exporter:latest
        resources:
          requests:
            cpu: 100m
            memory: 100Mi
        ports:
        - name: http-metrics
          containerPort: 9121
          protocol: TCP
          
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: redis-exporter
  name: redis-exporter
  namespace: monitor
spec:
  ports:
  - name: http-metirc
    protocol: TCP
    port: 9121
    targetPort: 9121
  selector:
    app: redis-exporter
```
## 两种配置Redis端点的方式
- 通过环境变量（只能采集单个Redis实例
``` 
        env:
        - name: TZ
          value: "Asia/Shanghai"
        - name: REDIS_ADDR
          value: "redis://redis-ztest.infra:6379"
        - name: REDIS_PASSWORD
          value: "xxxx:xxxx"
```
``` 
    - job_name: 'Redis'
      scrape_interval: 1m
      static_configs:
        - targets: ['redis-exporter.kube-monitoring:9121']
```

- Prom配置Target（可以采集多个Redis实例

注意这里的target如果需要认证，那么需要在环境变量中注入密码，在 target中注入密码是不生效的，但必须得有（觉得是个Bug）。并且密码最好是统一的。
``` 
- name: REDIS_PASSWORD
  value: "xxx:xxx"
```
```
      static_configs:
        - targets:
          - redis://'xxx:xxx'@redis-a.infra:6379
          - redis://'xxx:xxx'@redis-b.infra:6379
          - redis://'xxx:xxx'@redis-c.infra:6379
          - redis://'xxx:xxx'@redis-d.infra:6379
      metrics_path: /scrape
      relabel_configs:
        - source_labels: [__address__]
          target_label: __param_target
        - source_labels: [__param_target]
          separator: ;
          regex: redis://.*@(.*):(\d+)
          target_label: instance
          replacement: ${1}:${2}
          action: replace
        - target_label: __address__
          replacement: redis-exporter.monitor:9121
```
**参数解释**
```
        - source_labels: [__address__]
          target_label: __param_target
```
每个目标的 `__address__` 映射到 __param_target 查询参数。
- source_labels: `[__address__]`：取原始目标的地址。
- target_label: `__param_target`：将这个地址设为 Redis Exporter HTTP 请求中的 target 参数。


``` 
        - source_labels: [__param_target]
          separator: ;
          regex: redis://.*@(.*):(\d+)
          target_label: instance
          replacement: ${1}:${2}
          action: replace
```
从 `__param_target` 中提取实例主机和端口，并用它来设置 instance 标签。

``` 
        - target_label: __address__
          replacement: redis-exporter.monitor:9121
```
将 `__address__` 设置为 Prometheus 应该联系的 Redis Exporter 服务的地址。
- `target_label`: `__address__`：表示我们想要更改抓取目标的地址。
- `replacement`: `redis-exporter.monitor:9121`：将地址设置为 redis-exporter.monitor 上的 Redis Exporter 服务的端口 9121。

![img.png](img/redis-img.png)
## 查看指标数据
``` 
[root@iZ2zeh5cd0wu2m4o1m5xjaZ ~]# curl 10.15.1.2:9121/metrics -s | grep redis_up
# HELP redis_up Information about the Redis instance
# TYPE redis_up gauge
redis_up 1
```
- redis_up 1：代表成功连接Redis并采集到指标数据

## 监控大盘

[Dashboard JSON](../Dashboard/redis.json)

![img.png](img/redis-img3.png)
![img_1.png](img/redis-img2.png)