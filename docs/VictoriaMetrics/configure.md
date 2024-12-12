## 资源配置优化
### 限制内存百分比
- 参数：`-memory.allowedPercent`
- 作用：限制 VictoriaMetrics 进程可以使用的内存百分比。
- 说明：如果内存使用超过该百分比，系统会触发内存限制机制。
- 示例：`-memory.allowedPercent=70`
### 限制内存量（字节）
- 参数：`-memory.allowedBytes`
- 作用：限制 VictoriaMetrics 进程可以使用的内存量（以字节为单位）
- 说明：如果内存使用超过该值，系统会触发内存限制机制。
- 示例：`-memory.allowedBytes=8589934592`(限制8GB)

## 存储
### 指定存储路径
- 参数：`-storageDataPath`
- 作用：指定存储路径。
- 说明：通过设置目录路径，可以控制数据的存储位置和管理方式。
- 示例：`-storageDataPath=/mnt/ssd/victoria-metrics-data`
### 设置数据保留时间
- 参数：`-retentionPeriod`
- 作用：设置数据保留的时间周期。
- 说明：通过设置保留时间，可以控制数据的存储空间和管理方式。
- 示例：`-retentionPeriod=6`（保留 6 个月的数据）

## 查询优化
### 并发查询限制
- 参数：`-search.maxConcurrentRequests`
- 默认值：16
- 作用：控制搜索查询的最大并发请求数。
- 说明：设置系统同时处理的最大搜索请求数量，超过此数量的请求将被排队等待处理。
- 示例：`-search.maxConcurrentRequests=100`

### 单个查询的最大执行时间
- 参数：`-search.maxQueryDuration`
- 默认值：30s
- 作用：限制单个搜索查询的最大执行时间。
- 说明：设置搜索查询的最长执行时间，超过此时间的查询将被强制终止，以防止查询占用过多资源。
- 示例：`-search.maxQueryDuration=1m`

### 慢查询日志
- 参数：`-search.logSlowQueryDuration`
- 默认值：0
- 作用：记录执行时间超过指定阈值的慢查询。
- 说明：通过设置慢查询记录阈值，可以记录执行时间超过指定阈值的查询。
- 示例：`-search.logSlowQueryDuration=10s`
  
### 查询缓存
- 参数：`-search.cacheTimestampOffset`
- 作用：控制查询缓存的时间戳偏移量。
- 说明：通过设置时间戳偏移量，可以优化查询性能和时间戳处理逻辑。如果查询的时间戳在缓存的时间戳偏移范围内，VictoriaMetrics 会使用缓存的结果，从而提高查询性能。
- 示例：`-search.cacheTimestampOffset=10m`

### 限制查询返回时间序列数量
- 参数：`-search.maxSeries`
- 默认值：100000
- 作用：限制单个查询返回的时间序列数量。
- 说明：设置单个查询最多可以返回的时间序列数量，超过此限制的查询将返回部分结果或错误，以防止查询结果过大导致系统负载过高。
- 示例：`-search.maxSeries=50000`

### 限制单个时间序列数据点数量
- 参数：`-search.maxPointsPerTimeseries`
- 作用：限制单个时间序列在查询结果中返回的数据点数量。
- 说明：如果某个时间序列在查询结果中包含的数据点数量超过此限制，该时间序列将被限制或截断，以防止单个时间序列返回过多的数据点导致系统负载过高。
- 示例：`-search.maxPointsPerTimeseries=50000`

## 数据摄取优化
### 标签限制
- 参数：`-maxLabelsPerTimeseries`
- 作用：限制每个时间序列的最大标签数量(default=30)。
- 说明：如果标签数量超过该值，则拒绝该时间序列，并记录错误日志。可以有效防止标签爆炸问题。
- 例如：`-maxLabelsPerTimeseries=100`。

### 去重优化
- 存储启用。
- 参数：`-dedup.minScrapeInterval`
- 作用：优化去重逻辑。
- 说明：如果抓取间隔小于该值，则认为数据点是重复的，并进行去重。可以有效减少重复数据的存储。
- 例如：`-dedup.minScrapeInterval=1s`。

### 写入速率限制
- 参数：`-maxInsertRequestSize`
- 作用：限制写入请求的大小。
- 说明：如果插入请求的大小超过该值，则拒绝该请求，并返回错误。可以有效防止大请求攻击。
- 例如：`-maxInsertRequestSize=16777216（16MB）`。


