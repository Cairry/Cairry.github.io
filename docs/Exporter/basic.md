# 基础概念

## 介绍
`Exporter`是一个采集监控数据并通过`Prometheus`监控规范对外提供数据的组件，它负责从目标服务搜集指标数据，并将其转换为Prometheus支持的格式。
`Prometheus`会周期性调用`Exporter`提供的`Metrics`数据接口来获取数据。

## 通讯协议
Prometheus 使用 HTTP/HTTPS 协议来进行数据采集和传输。度量指标数据通过两种主要方式在客户端和 Prometheus 服务器之间进行通讯：Pull 模式和Push 模式。

服务端实现了 gzip压缩，数据传输时客户端不用担心文本过大。
### 拉取 Pull 模式
在 Pull 模式下，Prometheus 服务器定期从目标（Targets）中抓取（scrape）度量指标数据。这是 Prometheus 的默认通讯方式。目标可以是服务端点（如 HTTP 服务）、导出器（如 Node Exporter）等。

**Pull 模式通讯流程**
- 配置抓取目标：在 Prometheus 配置文件 prometheus.yml 中配置抓取目标。
- 定期抓取：Prometheus 根据配置文件中定义的抓取间隔（通常是 15 秒）从每个目标抓取度量指标数据。
- HTTP 请求：Prometheus 服务器向目标发送 HTTP GET 请求，目标返回度量指标数据。
- 解析和存储：Prometheus 服务器解析抓取到的度量指标数据并将其存储在时间序列数据库中。

**优点**
- 批量拉取（压缩）
- 监控耦合度比较低（按需求部署exporter）
- 易于排错
- 独立于监控系统之外，部署采集器，不需要依赖Server。

**缺点**
- 实时性不高
- 历史数据无法补充（只能拉取到当前最新状态）
- 无法跨域防火墙

### 推送 Push 模式
在 Push 模式下，客户端通过 Pushgateway 将度量指标数据推送到 Prometheus 服务器。这种方式适用于短生命周期的作业（如批处理作业）或没有被 Prometheus 直接抓取的目标。

**Push 模式通讯流程**
- 客户端推送数据：客户端将度量指标数据通过 HTTP POST 请求推送到 Pushgateway。
- Pushgateway 存储数据：Pushgateway 接收并临时存储这些度量指标数据。
- Prometheus 抓取：Prometheus 服务器定期从 Pushgateway 抓取度量指标数据。

**优点**
- 数据及时性，能及时到达Server
- 跨域防火墙

**缺点**
- 监控耦合性较高，会给监控系统的迭代带来很大阻碍

### 通讯协议和端口
- HTTP/HTTPS：Prometheus 通常通过 HTTP/HTTPS 进行数据抓取和传输。
- 默认端口：Prometheus 服务器默认监听 9090 端口，Pushgateway 默认监听 9091 端口，不同的导出器有各自的默认端口（如 Node Exporter 监听 9100 端口）。
### 安全性
- TLS/SSL：支持使用 TLS/SSL 来加密通讯，以确保数据传输的安全性。
- 认证和授权：可以使用基本认证、OAuth、基于 IP 的访问控制等方式来保护 Prometheus 服务器和目标。


## 数据格式
- 指标名称（Metric Name）：描述了时间序列数据的含义，例如`http_requests_total`表示 HTTP 请求的总数。

- 标签（Labels）：用于进一步描述度量指标。每个标签是一个键-值对，用于区分同一指标名称下的不同时间序列。例如，`http_requests_total{method="GET", handler="/api"}`表示特定 HTTP 方法和路径的请求总数。

- 值（Value）：指标在某个时间点的具体数值，可以是浮点数或整数。

- 时间戳（Timestamp）：表示数据采集的时间点，通常以`Unix`时间戳的形式存储。

**示例**
``` 
http_requests_total{method="GET", handler="/api"} 1027 1626568200
```
- 指标名称：`http_requests_total`
- 标签：`method="GET"`和`handler="/api"`
- 值：`1027`（表示在时间点`1626568200`时的请求总数）
- 时间戳：`1626568200`（`Unix`时间戳）


## 基础指标类型
### Counter（仪表盘）
**用途**

只增不减的累加指标

Counter就是一个计数器，表示一种累积性指标，该指标只能单调递增或在重新启动时重置为零

**例如**

可以使用计数器来统计后端服务的请求数，已完成的任务或错误。

### Gauge（计数器）
**用途**

可增可减的测量指标

Gauge是最简单的度量类型，只有一个简单的返回值，可增可减，也可以set为指定的值。所以Gauge通常用于反映当前状态。

**例如**

当前温度或当前内存的使用情况；也可以用于可增加可减少的技术指标。

### Histogram（直方图）
**用途**

自带Buckets区间用于统计分布的直方图

Histogram主要用于在设定的分布范围内（Buckets）记录大小或者次数。

**例如**

http请求响应时间：0-100ms、100-200ms、200-300ms、>300ms的分布情况，Histogram会自动创建3个指标。
指标分别为：
- 事件发送的总次数：比如当前一共发送了2次http请求。
- 所有事件产生值大小的总和：比如发生2次http请求总的响应时间，分别为90ms和150ms。
- 事件产生的值分布在buckets中的次数：比如响应时间0-100ms的请求1次，100-200ms的请求1次，其他的0次。

### Summary（摘要）
**用途**

数据分布统计图

Summary和Histogram类似，都可以做统计时间发生的次数或者大小，以及其分布情况。
分别都提供了对于事件的统计_count以及值的汇总_sum，因此使用_count和_sum时间序列可以计算出相同的内容。

同时都可以计算出和统计样本的分布情况，比如中位数，n分位数等等。不同在于Histogram可以通过histogram_quantile函数在服务器端计算分位数。而Summary的分位数则是直接在客户端定义。因此对于分位数的计算，Summary在通过PromQL进行查询时有更好的性能表现，而Histogram则会消耗客户端更多的资源。相对于客户端而言Histogram消耗的资源更少。

## Metrics注册流程
Prometheus的Client库提供了实现自定义Exporter的接口，在注册指标时，Prometheus要求实现Collector接口下的两个方法，分别是Describe和Collect，实现这两个方法就可以暴露自定义的数据：

RegisterMetrics
- 实际传一个Collector对象
``` 
// MustRegister implements Registerer.
func (r *Registry) MustRegister(cs ...Collector) {
	for _, c := range cs {
		if err := r.Register(c); err != nil {
			panic(err)
		}
	}
}
```

- Collector接口实现的方法
``` 
type Collector interface {
···
	Describe(chan<- *Desc)
···
	Collect(chan<- Metric)
}
```
Describe方法
> 传递指标描述符到channel中。
``` 
func (m Monitor) Describe(descs chan<- *prometheus.Desc) {
	descs <- m.InterfaceStatusCode
	descs <- m.SSLCertRemainingRime
}
```
Collect方法
> 执行抓取操作，返回数据传递到channel中，并且传递的同时绑定原先的指标描述符。
``` 
func (m Monitor) Collect(metrics chan<- prometheus.Metric) {

	for srvName, domainName := range config.DomainMap {
		// 探测 Domain 状态
		wg.Add(1)
		lock.Lock()
		go Gauge(srvName, domainName)
		lock.Unlock()
		wg.Wait()
	}

}
```

总结 
- 定义指标采集器结构体，实例化指标采集器（定义注册表根据需求规定指标名、描述信息、动态标签等）；
- 实现 指标采集方法，用于处理指标数据并返回数据供Collect方法采集。
- 实现Describe方法，收集描述信息；（告诉Prometheus我们定义了哪些prometheus.Desc结构，通过channel传递给上层）
- 实现Collect方法，实施采集指标；（真正实现数据采集的功能，将采集的数据结果通过channel传递给上层）
- 注册指标采集器，暴露Metrics接口；