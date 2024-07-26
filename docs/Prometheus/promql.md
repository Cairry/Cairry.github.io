# PromQL 常用的内置函数

## abs()
用于计算给定指标的绝对值。绝对值是指一个数值无论正负，其大小都为正。例如，abs(-3) 的结果是 3，abs(3) 的结果也是 3。

**语法**
``` 
abs(vector)
```
- vector: 输入的向量（即一个或多个时间序列）。

**案例**
``` 
node_load{instance="server1"} -1.5
node_load{instance="server2"} 2.3
node_load{instance="server3"} -3.7
```
- 计算绝对值
``` 
abs(node_load)
```
``` 
node_load{instance="server1"} 1.5
node_load{instance="server2"} 2.3
node_load{instance="server3"} 3.7
```

**使用场景**
- 处理负值数据：在一些情况下，监控数据可能会包含负值（例如温度传感器的偏差值），使用 abs() 可以将这些值转换为非负数。
- 差值计算：计算两个时间序列的差值，并取绝对值，以衡量它们之间的距离或差异。

## absent()
用于检测给定时间范围内是否缺少某些时间序列。如果没有匹配的时间序列，absent 返回一个常量向量，其标签值为 {}，值为 1。如果有匹配的时间序列，则 absent 不返回任何内容。

**语法**
``` 
absent(vector)
```
- vector: 输入的向量（即一个或多个时间序列）。

**案例**
``` 
cpu_usage{instance="server1"} 40
cpu_usage{instance="server2"} 60
```
- 检测缺失的指标
``` 
absent(cpu_usage{instance="server3"})
```
``` 
{} 1
```
> 表示 instance="server3" 的 cpu_usage 指标缺失。

## absent_over_time()
用于检测在指定时间范围内是否有时间序列缺失。如果在指定的时间范围内，没有匹配的时间序列数据点，则返回一个常量向量，其标签值为 {}，值为 1。如果在指定的时间范围内有匹配的时间序列数据点，则 absent_over_time 不返回任何内容。

**语法**
``` 
absent_over_time(range-vector)
```
- range-vector: 一个时间范围向量，用于指定要检查的时间范围。

**案例**
``` 
cpu_usage{instance="server1"} 40
cpu_usage{instance="server2"} 60
```
- 检测过去5分钟内是否有缺失的指标
``` 
absent_over_time(cpu_usage[5m])
```
如果 cpu_usage 指标在过去5分钟内有数据点存在，查询结果为空。如果没有任何 cpu_usage 指标在过去5分钟内有数据点存在
``` 
{} 1
```
**使用场景**
- 用于检测监控数据中的缺失情况。它可以帮助我们确保关键指标的存在，检测特定实例或服务的指标缺失，并在监控系统中触发相应的报警。


## ceil()
用于将给定的数值向上取整，即返回大于或等于输入数值的最小整数。例如，ceil(1.2) 的结果是 2，ceil(-1.2) 的结果是 -1。

**语法**
``` 
ceil(vector)
```
- vector: 输入的向量（即一个或多个时间序列）。

**案例**
```
mem_usage{instance="server1"} 40.3
```
- 将负载值向上取整
``` 
ceil(mem_usage)
```
``` 
mem_usage{instance="server1"} 41
```

**使用场景**
- 显示整数值：在一些情况下，我们希望将度量值显示为整数，以便于理解和展示。
- 阈值计算：在计算阈值或进行警报配置时，可以使用向上取整确保结果是一个整数。

## changes()
用于计算在指定时间范围内时间序列值的变化次数。这个函数对于监控状态变化、事件计数和其他动态行为特别有用。

**语法**
``` 
changes(range-vector)
```
- range-vector: 一个时间范围向量，用于指定要检查的时间范围。
**案例**
```
http_requests_total{instance="server1"} 100 -> 150 -> 200 -> 250
http_requests_total{instance="server2"} 200 -> 250 -> 300 -> 350
```
- 计算请求数的变化次数
``` 
changes(http_requests_total[5m])
```
``` 
http_requests_total{instance="server1"} 3
http_requests_total{instance="server2"} 3
```

**使用场景**
- 监控状态变化：计算服务状态、主机状态或其他状态的变化次数，以了解系统的稳定性和波动情况。
- 事件计数：监控事件发生的次数，如故障、警报、请求等。
- 检测异常行为：通过计算变化次数，可以检测出一些异常行为，例如频繁的状态切换或突发的事件。

## delta()
用于计算时间序列在指定时间范围内的变化量（即增量）。它返回时间序列在指定时间间隔内的第一个和最后一个数据点之间的差值。

**语法**
``` 
delta(range-vector)
```
- range-vector: 一个时间范围向量，用于指定要计算增量的时间范围。
**案例**
``` 
http_requests_total{instance="server1"} 100
http_requests_total{instance="server1"} 120
http_requests_total{instance="server1"} 130
http_requests_total{instance="server1"} 140 
```
- 计算过去5分钟内的增量
``` 
delta(http_requests_total{instance="server1"}[5m]) 
```
``` 
delta(http_requests_total{instance="server1"}[5m]) = 140 - 100 = 40
```
**使用场景**
- 计算增长趋势：了解时间序列在特定时间段内的增长情况，例如请求量、错误数等。
- 性能监控：监控系统性能指标的变化量，如 CPU 使用率、内存占用等。
- 报警条件：设置报警规则，当时间序列的增量超过预期阈值时触发警报。

## deriv()
用于计算时间序列数据的导数。它通过计算时间序列在指定时间范围内的变化率（即每秒的增长率）来分析数据的变化趋势。

**语法**
``` 
deriv(range-vector)
```
- range-vector: 一个时间范围向量，用于指定要计算导数的时间范围。
**案例**
``` 
http_requests_total{instance="server1"} 100
http_requests_total{instance="server1"} 120
http_requests_total{instance="server1"} 130
http_requests_total{instance="server1"} 140
```
- 计算过去5分钟内的导数
``` 
deriv(http_requests_total{instance="server1"}[5m])
```
``` 
deriv(http_requests_total{instance="server1"}[5m]) = (140 - 100) / 300s = 0.4 requests per second
```
> 表示在过去5分钟内，请求计数每秒增加了0.4个请求。

**使用场景**
- 监控趋势：通过计算数据的导数，可以了解监控指标的变化速率，帮助识别系统负载、请求率等趋势。
- 性能优化：分析数据变化率，以便及时调整系统资源或优化性能。
- 异常检测：检测数据突变或异常波动，从而触发警报或进行进一步调查。

## idelta()
用于计算时间序列数据的增量。它返回时间序列在每个时间点的增量值，即当前时间点与上一个时间点之间的差值。

**语法**
``` 
idelta(v range-vector) or idelta(v instant-vector)
```
- v: 一个时间范围向量或即时向量，表示要计算增量的时间序列数据。
**案例**
``` 
http_requests_total{instance="server1"} 100 (timestamp: 1626568200)
http_requests_total{instance="server1"} 120 (timestamp: 1626568300)
http_requests_total{instance="server1"} 130 (timestamp: 1626568400)
http_requests_total{instance="server1"} 140 (timestamp: 1626568500) 
```
- 计算时间范围内的增量
``` 
idelta(http_requests_total{instance="server1"}[5m])
```
``` 
idelta(http_requests_total{instance="server1"}[5m]) =
  120 - 100 (at timestamp 1626568300) = 20
  130 - 120 (at timestamp 1626568400) = 10
  140 - 130 (at timestamp 1626568500) = 10
```
**使用场景**
- 变化率分析：通过计算时间序列的增量，可以了解数据在不同时间段内的变化速率，例如请求速率、传输速率等。

## increase()
用于计算时间序列数据在给定时间范围内的增加量（增量总和）。它返回时间序列在时间范围内的第一个和最后一个数据点之间的增量值，即总增量。

**语法**
``` 
increase(v range-vector) or increase(v instant-vector)
```
- v: 一个时间范围向量或即时向量，表示要计算增量的时间序列数据。
**案例**
``` 
http_requests_total{instance="server1"} 100 (timestamp: 1626568200)
http_requests_total{instance="server1"} 120 (timestamp: 1626568300)
http_requests_total{instance="server1"} 130 (timestamp: 1626568400)
http_requests_total{instance="server1"} 140 (timestamp: 1626568500) 
```
- 计算时间范围内的增加量
``` 
increase(http_requests_total{instance="server1"}[5m])
```
``` 
increase(http_requests_total{instance="server1"}[5m]) = 140 - 100 = 40
```
>表示在过去5分钟内，请求计数总共增加了40次。

**使用场景**
- 趋势分析：通过计算时间序列的增加量，可以了解数据在不同时间段内的总体增长趋势，例如请求总数、资源使用量等。
- 报警设置：设置报警规则，当时间序列在一定时间范围内的增加量超过预期阈值时触发警报，帮助监控系统的健康状态。
- 容量规划：根据时间序列的增加量分析系统的使用趋势，进行容量规划和资源分配。

## irate()
用于计算时间序列数据的即时增长率（瞬时变化率）。它返回时间序列在指定时间范围内的每秒增长率，即每秒的增量值。

**语法**
``` 
irate(v range-vector) or irate(v instant-vector)
```
- v: 一个时间范围向量或即时向量，表示要计算增长率的时间序列数据。
**案例**
``` 
http_requests_total{instance="server1"} 100 (timestamp: 1626568200)
http_requests_total{instance="server1"} 120 (timestamp: 1626568300)
http_requests_total{instance="server1"} 130 (timestamp: 1626568400)
http_requests_total{instance="server1"} 140 (timestamp: 1626568500) 
```
- 计算时间范围内的即时增长率
``` 
irate(http_requests_total{instance="server1"}[5m])
```
``` 
irate(http_requests_total{instance="server1"}[5m]) =
  (120 - 100) / 300s = 0.0667 requests per second (at timestamp 1626568300)
  (130 - 120) / 300s = 0.0333 requests per second (at timestamp 1626568400)
  (140 - 130) / 300s = 0.0333 requests per second (at timestamp 1626568500)
```

**使用场景**
- 实时监控：通过计算即时增长率，可以实时监控系统指标的变化速率，例如请求速率、流量变化等。
- 异常检测：检测数据的瞬时变化率，发现异常或突发事件，及时触发警报和应对措施。
- 性能分析：分析系统或服务的响应时间、吞吐量等即时变化情况，进行性能优化和调整。

## label_join()
用于将一个或多个标签的值合并为一个新的标签值。

**语法**
``` 
label_join(v instant-vector, separator, label, ...source_labels)
```
- v: 一个即时向量，表示要操作的时间序列数据。
- separator: 字符串，表示要用作分隔符的字符串。
- label: 字符串，表示要创建的新标签的名称。
- source_labels: 一个或多个字符串，表示要合并值的源标签名称。

**案例**
``` 
cpu_usage{instance="server1", region="us-east"} 0.75
cpu_usage{instance="server2", region="us-west"} 0.65
cpu_usage{instance="server3", region="eu-central"} 0.80
```
- 创建一个新的标签 server_region，其值由 instance 和 region 标签值合并而成，使用 - 作为分隔符
``` 
label_join(cpu_usage, "-", "server_region", "instance", "region") 
```
``` 
cpu_usage{instance="server1", region="us-east", server_region="server1-us-east"} 0.75
cpu_usage{instance="server2", region="us-west", server_region="server2-us-west"} 0.65
cpu_usage{instance="server3", region="eu-central", server_region="server3-eu-central"} 0.80
```
**使用场景**
- 标签重构：将多个现有标签的值合并为一个新的标签，以便更方便地过滤和查询数据。
- 数据归类：根据现有标签值创建新的分类标签，帮助组织和分析数据。
- 查询优化：通过合并标签值减少数据冗余，简化查询表达式，提高查询效率和性能。

## label_replace()
函数用于基于正则表达式修改标签。它可以创建或替换现有标签，非常适合在查询过程中动态地调整标签。

**语法**
``` 
label_replace(vector, dst_label, replacement, src_label, regex)
```
- vector: 输入的向量（例如一个时间序列）。
- dst_label: 目标标签的名称。
- replacement: 替换值，支持正则捕获组（例如 $1）。
- src_label: 源标签的名称。
- regex: 用于匹配源标签值的正则表达式。

**案例**
``` 
http_requests_total{instance="host1:9090", job="service-A"} 123
```
- 提取源标签并创建新标签
``` 
label_replace(http_requests_total, "hostname", "$1", "instance", "([^:]+):.*")
```
``` 
http_requests_total{instance="host1:9090", job="service-A", hostname="host1"} 123
```
- 修改现有标签
``` 
label_replace(http_requests_total, "job", "$1", "job", "service-(.*)")
```
``` 
http_requests_total{instance="host1:9090", job="A"} 123
```

## rate()
用于计算时间序列数据的速率，即每秒的平均增长率。它通常用于计算时间范围内的数据点的增长速率。

**语法**
``` 
rate(v range-vector) or rate(v instant-vector)
```
- v: 一个时间范围向量或即时向量，表示要计算速率的时间序列数据。

**案例**
``` 
http_requests_total{instance="server1"} 100 (timestamp: 1626568200)
http_requests_total{instance="server1"} 120 (timestamp: 1626568300)
http_requests_total{instance="server1"} 130 (timestamp: 1626568400)
http_requests_total{instance="server1"} 140 (timestamp: 1626568500)
```
- 计算时间范围内的速率
``` 
rate(http_requests_total{instance="server1"}[5m]) 
```
```
rate(http_requests_total{instance="server1"}[5m]) =
  (140 - 100) / (1626568500 - 1626568200) ≈ 13.33 requests per second
```
> 表示在过去5分钟内，请求计数的平均增长率约为每秒 13.33 次请求。

**使用场景**
- 实时监控：通过计算时间序列的速率，可以实时监控系统指标的变化速率，例如请求速率、数据流量等。
- 性能分析：分析系统或服务的响应时间、吞吐量等的变化速率，帮助识别和解决性能瓶颈。
- 容量规划：根据系统负载的变化速率进行容量规划和资源调度，以确保系统稳定和高效运行。

## resets()
用于计算时间序列数据在指定时间范围内重置（重新开始计数）的次数。它适用于计算时间序列在给定时间段内从零重新开始计数的情况。

**语法**
``` 
resets(v range-vector)
```
- v: 一个时间范围向量，表示要计算重置次数的时间序列数据。

**案例**
``` 
counter_value{instance="server1"} 0 (timestamp: 1626568200)
counter_value{instance="server1"} 10 (timestamp: 1626568300)
counter_value{instance="server1"} 0 (timestamp: 1626568400)
counter_value{instance="server1"} 5 (timestamp: 1626568500)
counter_value{instance="server1"} 15 (timestamp: 1626568600)
```
- 计算 counter_value 指标在过去5分钟内重置的次数
``` 
resets(counter_value{instance="server1"}[5m]) 
```
``` 
resets(counter_value{instance="server1"}[5m]) = 1
```
> 表示在过去5分钟内，counter_value 指标从零重新开始计数了1次。

**使用场景**
- 计数器监控：用于监控计数器或累加器类型的指标，检测其是否在某个时间段内重新初始化或重置。
- 异常检测：检测计数器异常行为，如意外重置或计数器状态不稳定的情况。
- 系统运行分析：分析系统或服务中计数器的行为，帮助理解和优化系统的运行和状态管理。

## round()
用于将时间序列数据的值四舍五入到指定的小数位数。

**语法**
``` 
round(v instant-vector) or round(v range-vector, resolution)
```
- v: 一个即时向量或时间范围向量，表示要进行四舍五入操作的时间序列数据。
- resolution: 可选参数，表示要四舍五入到的小数位数，默认为 0。(四舍五入到两位小数：`round(http_request_duration_seconds{instance="server1"}, 2)`)

**案例**
``` 
http_request_duration_seconds{instance="server1"} 1.234 (timestamp: 1626568200)
http_request_duration_seconds{instance="server1"} 2.567 (timestamp: 1626568300)
http_request_duration_seconds{instance="server1"} 3.789 (timestamp: 1626568400)
http_request_duration_seconds{instance="server1"} 4.321 (timestamp: 1626568500)
```
- 四舍五入到整数
``` 
round(http_request_duration_seconds{instance="server1"}) 
```
``` 
http_request_duration_seconds{instance="server1"} 1 (timestamp: 1626568200)
http_request_duration_seconds{instance="server1"} 3 (timestamp: 1626568300)
http_request_duration_seconds{instance="server1"} 4 (timestamp: 1626568400)
http_request_duration_seconds{instance="server1"} 4 (timestamp: 1626568500)
```

**使用场景**
- 数据展示：用于将时间序列数据的值按照需求进行格式化和展示。
- 报表生成：生成可读性更好的数据报表或指标展示。
- 阈值设置：对特定指标的阈值进行调整或比较，以便与其他指标进行对比分析。

## scalar()
用于提取时间序列数据中的标量值（即单个数值）。它适用于将时间序列数据转换为标量值，以便进行数值计算或比较。

**语法**
``` 
scalar(v instant-vector) or scalar(v range-vector)
```
- v: 一个即时向量或时间范围向量，表示要提取标量值的时间序列数据

**案例**
``` 
cpu_usage{instance="server1"} 0.75 (timestamp: 1626568200)
cpu_usage{instance="server1"} 0.65 (timestamp: 1626568300)
cpu_usage{instance="server1"} 0.80 (timestamp: 1626568400)
cpu_usage{instance="server1"} 0.70 (timestamp: 1626568500)
```
- 获取 cpu_usage 指标的最新值作为标量值
``` 
scalar(cpu_usage{instance="server1"})
```
``` 
0.70
```
**使用场景**
- 单值提取：将时间序列数据中的单个数值提取出来，用于进行单值计算或与其他标量进行比较。
- 状态监控：监控系统或服务的特定指标的当前状态或数值，进行实时状态监控和警报处理。
- 趋势分析：分析时间序列数据的当前值，帮助理解系统的当前状态和趋势。

## avg_over_time()
用于计算指定时间范围内时间序列数据的平均值。

**语法**
``` 
avg_over_time(range-vector)
```
- range-vector: 表示要计算平均值的时间范围向量，例如 [5m] 表示过去5分钟内的数据。

**案例**
``` 
http_request_duration_seconds{instance="server1"} 1.2 (timestamp: 1626568200)
http_request_duration_seconds{instance="server1"} 2.5 (timestamp: 1626568300)
http_request_duration_seconds{instance="server1"} 3.1 (timestamp: 1626568400)
http_request_duration_seconds{instance="server1"} 4.2 (timestamp: 1626568500)
```
- 计算过去5分钟内的平均响应时间
``` 
avg_over_time(http_request_duration_seconds{instance="server1"}[5m])
```

**使用场景**
- 用于监控系统或服务的性能指标，如平均响应时间、平均处理时间等。

## min_over_time()
用于计算指定时间范围内时间序列数据的最小值。

**语法**
``` 
min_over_time(range-vector)
```
- range-vector: 表示要计算最小值的时间范围向量，例如 [5m] 表示过去5分钟内的数据。
**案例**
``` 
http_request_duration_seconds{instance="server1"} 1.2 (timestamp: 1626568200)
http_request_duration_seconds{instance="server1"} 2.5 (timestamp: 1626568300)
http_request_duration_seconds{instance="server1"} 0.8 (timestamp: 1626568400)
http_request_duration_seconds{instance="server1"} 4.2 (timestamp: 1626568500)
```
- 计算过去5分钟内的最小响应时间
``` 
min_over_time(http_request_duration_seconds{instance="server1"}[5m])
```
**使用场景**
- 用于监控系统或服务的性能指标，如最小响应时间、最小处理时间等。

## max_over_time()
用于计算指定时间范围内时间序列数据的最大值。

**语法**
``` 
max_over_time(range-vector)
```
- range-vector: 表示要计算最大值的时间范围向量，例如 [5m] 表示过去5分钟内的数据。

**案例**
```
http_request_duration_seconds{instance="server1"} 1.2 (timestamp: 1626568200)
http_request_duration_seconds{instance="server1"} 2.5 (timestamp: 1626568300)
http_request_duration_seconds{instance="server1"} 0.8 (timestamp: 1626568400)
http_request_duration_seconds{instance="server1"} 4.2 (timestamp: 1626568500)
```
- 计算过去5分钟内的最大响应时间
``` 
max_over_time(http_request_duration_seconds{instance="server1"}[5m])
```
**使用场景**
- 用于监控系统或服务的性能指标，如最大响应时间、最大处理时间等。

## sum_over_time()
用于计算指定时间范围内时间序列数据的总和。它对给定时间范围内的每个时间点的值进行求和，并返回总和结果。

**语法**
``` 
sum_over_time(range-vector)
```
- range-vector: 表示要计算总和的时间范围向量，例如 [5m] 表示过去5分钟内的数据。

**案例**
``` 
http_requests_total{instance="server1"} 10 (timestamp: 1626568200)
http_requests_total{instance="server1"} 15 (timestamp: 1626568300)
http_requests_total{instance="server1"} 20 (timestamp: 1626568400)
http_requests_total{instance="server1"} 25 (timestamp: 1626568500)
```
- 计算过去5分钟内的总请求数
``` 
sum_over_time(http_requests_total{instance="server1"}[5m])
```

**使用场景**
- 用于计算某个指标在一段时间内的累计值，例如总请求数、总错误数等。

## count_over_time()
用于计算指定时间范围内时间序列数据的样本数量。它返回在给定时间范围内的样本数目。

**语法**
``` 
count_over_time(range-vector)
```
- range-vector: 表示要计算样本数量的时间范围向量，例如 [5m] 表示过去5分钟内的数据。

**案例**
``` 
http_request_duration_seconds{instance="server1"} 1.2 (timestamp: 1626568200)
http_request_duration_seconds{instance="server1"} 2.5 (timestamp: 1626568300)
http_request_duration_seconds{instance="server1"} 0.8 (timestamp: 1626568400)
http_request_duration_seconds{instance="server1"} 4.2 (timestamp: 1626568500)
```
- 计算过去5分钟内的样本数量
``` 
count_over_time(http_request_duration_seconds{instance="server1"}[5m])
```
**使用场景**
- 数据密度分析：用于分析某个时间范围内数据的密度，例如请求响应时间的样本数量，帮助理解数据采集频率和数据质量。
- 监控指标覆盖率：通过计算样本数量，可以监控数据是否存在丢失或采集间隔是否过大，确保监控数据的完整性和准确性。
- 趋势分析和容量规划：在分析系统或服务的使用情况和趋势时，计算样本数量可以帮助确定系统负载和容量需求。

## last_over_time()
用于返回指定时间范围内时间序列数据的最后一个值。

**语法**
``` 
last_over_time(range-vector)
```
- range-vector: 表示要获取最后一个值的时间范围向量，例如 [5m] 表示过去5分钟内的数据。

**案例**
``` 
http_request_duration_seconds{instance="server1"} 1.2 (timestamp: 1626568200)
http_request_duration_seconds{instance="server1"} 2.5 (timestamp: 1626568300)
http_request_duration_seconds{instance="server1"} 0.8 (timestamp: 1626568400)
http_request_duration_seconds{instance="server1"} 4.2 (timestamp: 1626568500)
```
- 计算过去5分钟内的最后一个响应时间
``` 
last_over_time(http_request_duration_seconds{instance="server1"}[5m])
```
**使用场景**
- 用于监控系统或服务的最新状态，例如最新的响应时间、最新的请求数等。

## group_right()
用于 PromQL 查询的操作符，用于连接不同指标集合的标签。当进行不同指标集合之间的连接时，group_right 指定右侧指标集合的标签如何影响结果。它在 Prometheus 的 on 和 ignoring 操作符中与 * 或 / 操作符结合使用，以控制连接过程。

**案例**

假设有以下两个指标：
- 左侧集合：`http_requests_total`，具有标签 `{instance, job}`
- 右侧集合：`instance_info`，具有标签 `{instance, region, datacenter}`

希望通过 `instance` 标签连接这两个集合，并保留 `region` 和 `datacenter` 标签。
``` 
http_requests_total
* on(instance) group_right(region, datacenter) instance_info
```
- 连接方式：根据 `instance` 标签进行连接。

- 保留信息：连接后结果中，保留来自右侧集合的 `region` 和 `datacenter` 标签。

**使用场景**
- 在需要将多个来源的指标进行聚合时，使用 `group_right` 保留来自右侧集合的上下文信息。