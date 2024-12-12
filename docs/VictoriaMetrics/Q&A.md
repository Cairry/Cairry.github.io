# 常见问题

### 指标量过高导致VmAgent OOM
默认情况下，`vmagent`解析来自抓取目标的完整响应，应用重新标记，然后将生成的指标一次性推送到存储中。当抓取目标公开少量指标（例如少于 10K）时，此模式在大多数情况下效果很好。但是，当抓取目标公开大量指标时（例如，在大型`Kubernetes`集群中`vmagent`抓取时`kube-state-metrics`），此模式可能会占用大量内存。建议为此类目标启用流解析模式。启用此模式后，`vmagent`将分块处理来自抓取目标的响应。这可以在抓取公开数百万个指标的目标时节省内存。
``` 
scrape_configs:
- job_name: 'big-federate'
  stream_parse: true    // 再较大的指标Job中添加此配置
  static_configs:
  - targets:
    - big-prometheus1
    - big-prometheus2
  metrics_path: /federate
  params:
    'match[]': ['{__name__!=""}']
```

### Metric标签过大采集异常
- 服务启动配置
  - `-maxLabelsPerTimeseries`: 参数用于限制每个时间序列（Time Series）的最大标签数量。默认值：30。

- 用途
  - 防止标签爆炸：在 Prometheus 和 VictoriaMetrics 中，标签（Labels）用于标识时间序列的维度。如果标签数量过多，可能会导致时间序列数量爆炸性增长，从而影响系统的性能和存储效率。
  - 限制标签数量：通过设置 -maxLabelsPerTimeseries，可以限制每个时间序列的标签数量，从而避免标签爆炸问题。

### 扩大并发查询请求
- 服务启动配置
  - `-search.maxConcurrentRequests`: 参数用于限制并发查询请求的最大数量。默认值：16。
- 用途
  - 防止查询过载：在高并发场景下，过多的查询请求可能会导致系统资源耗尽，从而影响系统的稳定性和性能。
  - 限制并发查询：通过设置 -search.maxConcurrentRequests，可以限制并发查询请求的数量，从而避免查询过载问题。
