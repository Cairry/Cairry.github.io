# RocketMQ 资源监控

**前置条件**
- 环境中存在MQ服务

## 监控范围

- Broker QPS/TPS
    - `rocketmq_broker_tps`：监控 RocketMQ Broker 的每秒事务数 (Transactions Per Second)。用于评估 Broker 处理事务的能力，以确保其在高负载下的稳定性。
    - `rocketmq_broker_qps`：监控 RocketMQ Broker 的每秒查询数 (Queries Per Second)。用于分析 Broker 的查询性能，帮助优化查询效率。
- 消息积压
    - `sum(rocketmq_producer_offset) by (topic) - on(topic)  group_right  sum(rocketmq_consumer_offset) by (group,topic) and (sum(rocketmq_producer_offset) by (topic) - on(topic)  group_right  sum(rocketmq_consumer_offset) by (group,topic) > 0)`：用于计算 RocketMQ 中每个主题的消息积压量。监控消息的滞后情况，帮助运维人员识别系统瓶颈。
- 生产者/消费者TPS
    - `sum(rocketmq_producer_tps) by (topic)`：每个主题下生产者的事务处理速率 (TPS)。监控生产者在不同主题下的消息生成速率，评估生产者性能。
    - `sum(rocketmq_consumer_tps) by (topic)`：每个主题下消费者的事务处理速率 (TPS)。用于评估消费者的消费效率，帮助优化消费者的处理能力。
- 每秒生产/消费大小
    - `sum(rocketmq_producer_message_size) by (topic)`：计算每个主题下生产者的每秒消息生产大小。分析生产者生成的消息流量，帮助规划网络和存储资源。
    - `sum(rocketmq_consumer_message_size) by (topic)`：计算每个主题下消费者的每秒消息消费大小。用于分析消费者的流量需求，确保其能够处理预期的消息负载。
- 生产/消费进度offset
    - `sum(rocketmq_producer_offset) by (broker,topic)`：表示每个 Broker 下每个主题的生产者偏移量。用于监控生产者的生产进度，确保其能够按时生成消息。
    - `sum(rocketmq_consumer_offset) by (broker,topic)`：每个 Broker 下每个主题的消费者偏移量。用于监控消费者的消费进度，帮助识别可能的延迟问题。
- 消费延时
    - `sort_desc(sum(rocketmq_group_get_latency_by_storetime) by (broker,group,topic)) and (sum(rocketmq_group_get_latency_by_storetime) by (broker,group,topic) > 0)`：计算并排序每个 Broker 下每个消费者组在每个主题上的消费延时。用于识别和解决消费瓶颈，确保消息能够被及时处理。

## 部署Exporter
``` 
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: rocketmq-exporter
  name: rocketmq-exporter
  namespace: monitor
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rocketmq-exporter
  template:
    metadata:
      labels:
        app: rocketmq-exporter
    spec:
      containers:
        - name: rocketmq-exporter
          image: sawyerlan/rocketmq-exporter:latest
          args:
          - --rocketmq.config.namesrvAddr=rocketmq-namesrv-0:9876;rocketmq-namesrv-1:9876;rocketmq-namesrv-2:9876
          imagePullPolicy: IfNotPresent
          ports:
          - containerPort: 5557
            name: metrics
          securityContext:
            privileged: false
      restartPolicy: Always

---
apiVersion: v1
kind: Service
metadata:
  name: rocketmq-exporter
  namespace: monitor
spec:
  ports:
    - port: 5557
      targetPort: 5557
      protocol: TCP
      name: metrics
  selector:
    app: rocketmq-exporter
```

## Prometheus 端点配置
``` 
    - job_name: 'RocketMQ'
      scrape_interval: 1m
      static_configs:
        - targets: 
          - rocketmq-exporter.monitor:5557
```

## 监控大盘

[Dashboard JSON](../Dashboard/rocketmq.json)



