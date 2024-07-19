# Metrics实战开发
可以`Prometheus`提供的`SDK`快速完成`Metrics`数据的暴露。

安装
``` 
go get -u github.com/prometheus/client_golang/prometheus/promhttp
```

## 默认指标

`Prometheus`提供的Client会暴露全局默认指标注册表，其中包含`promhttp`处理器和`runtime`相关的默认指标，根据不同指标名称的前缀区分：
- `go_*`：以`go_`为前缀的指标是关于Go运行时相关的指标，比如垃圾回收时间、goroutine数量等，都是go客户端特有的，其他语言可能会暴露各自语言的运行时指标。
- `promhttp_*`：`promhttp`工具包的相关指标，用于跟踪指标请求的处理。
``` 
import (
	"fmt"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"net/http"
)

func main() {
	http.Handle("/metrics", promhttp.Handler())
	http.ListenAndServe(":8005", nil)
}
```
访问
``` 
# curl 127.0.0.1:8005/metrics
···
# HELP go_memstats_sys_bytes Number of bytes obtained from system.
# TYPE go_memstats_sys_bytes gauge
go_memstats_sys_bytes 8.784912e+06
# HELP go_threads Number of OS threads created.
# TYPE go_threads gauge
go_threads 7
# HELP promhttp_metric_handler_requests_in_flight Current number of scrapes being served.
# TYPE promhttp_metric_handler_requests_in_flight gauge
promhttp_metric_handler_requests_in_flight 1
# HELP promhttp_metric_handler_requests_total Total number of scrapes by HTTP status code.
# TYPE promhttp_metric_handler_requests_total counter
promhttp_metric_handler_requests_total{code="200"} 0
promhttp_metric_handler_requests_total{code="500"} 0
promhttp_metric_handler_requests_total{code="503"} 0
```

## 采集器
通过Prometheus提供的Collectors发现，直接把指标注册到Registry中的方式不太优雅，为了更好的模块化，需要把指标采集封装一个Collector对象，这也是很多第三方Collector的标准写法。

**常用注册方法**
- MustNewConstMetric：注册Gauge、Counter类型指标
- MustNewConstHistogram：注册Histogram类型指标
- MustNewConstSummary：注册Summary类型指标

Collector接口声明
``` 
type Collector interface {
	// 指标的一些描述信息, 就是# 标识的那部分
	// 注意这里使用的是指针, 因为描述信息 全局存储一份就可以了
	Describe(chan<- *Desc)
	// 指标的数据, 比如 promhttp_metric_handler_errors_total{cause="gathering"} 0
	// 这里没有使用指针, 因为每次采集的值都是独立的
	Collect(chan<- Metric)
}
```

源码
``` 

// EmptyRegistry 空指标注册表
var (
	EmptyRegistry = prometheus.NewRegistry()
)

// Monitor 创建采集器
type Monitor struct {
	InterfaceStatusCode *prometheus.Desc
}

// NewMonitorMetrics 创建采集器指标注册规范
func NewMonitorMetrics() *Monitor {
	return &Monitor{
		InterfaceStatusCode: prometheus.NewDesc(
			"url_interface_status_code", // 指标名称
			"url 接口状态码",                 // 描述信息
			[]string{"app", "url"},      // 动态指标
			nil,                         // 静态指标
		),
	}
}

// Describe 收集描述信息
func (m Monitor) Describe(desc chan<- *prometheus.Desc) {
	desc <- m.InterfaceStatusCode
}

// Collect 收集指标数据
func (m Monitor) Collect(metrics chan<- prometheus.Metric) {
	metrics <- prometheus.MustNewConstMetric(
		m.InterfaceStatusCode,
		prometheus.GaugeValue,
		float64(100),
		"test",
		"http://url",
	)
}

func TestRegisterer() {
	// 注册采集器
	EmptyRegistry.MustRegister(NewMonitorMetrics())
	http.HandleFunc("/metrics", func(writer http.ResponseWriter, request *http.Request) {
		promhttp.HandlerFor(EmptyRegistry,
			promhttp.HandlerOpts{ErrorHandling: promhttp.ContinueOnError}).ServeHTTP(writer, request)
	})
	_ = http.ListenAndServe(":8001", nil)
}

func main() {

	TestRegisterer()

}
```

访问
```
% curl 127.0.0.1:8001/metrics
# HELP url_interface_status_code url 接口状态码
# TYPE url_interface_status_code gauge
url_interface_status_code{app="test",url="http://url"} 100
```

## 实战项目源码
- https://github.com/Cairry/exporter.git

## 问题
### WithLabelValues和MustNewConst{Metric/Histogram/Summary}的区别
在开发exporter时遇到了一个问题，当我使用如下两种方式注册Metrics时，进程所消耗的资源是不一样的，WithLabelValues注册label消耗的资源特别高，使用MustNewConstMetric消耗就特别低，因此想看一下到底是怎么个事儿

`WithLabelValues`和`MustNewConst{Metric/Histogram/Summary}`都是 Prometheus 客户库中用于创建指标的方法。两者都支持动态标签，但它们在使用方式和适用场景上有所不同。

**WithLabelValues**
- 使用方式：
  - 使用 WithLabelValues 方法直接传入动态标签值。
``` 
metric := pgc.HTTPLatencyHistogramCollect.WithLabelValues(name, strconv.Itoa(statusCode), requestPath)
metric.Observe(latency)

metric.Collect(ch) 
```

- 适用场景：
  - 适用于更复杂指标，具有动态值或大量标签。
  - 提供更大的灵活性，可以轻松捕获指标中的各种属性和变化。
  - 适用于需要根据特定标签组合进行细粒度分析的场景。

**MustNewConstMetric**
- 使用方式：
  - 使用 Desc 结构定义指标名称、帮助文本、类型和标签。
  - 在 Desc 结构中指定动态标签名称。
  - 使用 MustNewConstMetric 方法创建指标，并传入动态标签值。
``` 
pid := strconv.Itoa(os.Getpid())
cmdline := os.Args[0]
user := os.Getenv("USER")
cpuUsage := 50.0 // Percentage

desc := prometheus.NewDesc(
    "cpu_usage",
    "CPU usage of process",
    []string{"pid", "cmdline", "user"},
    nil,
)

metric := prometheus.MustNewConstMetric(
    desc,
    prometheus.GaugeValue,
    cpuUsage,
    pid,
    cmdline,
    user,
)

metric.Collect(ch) 
```
- 适用场景：
  - 适用于简单指标，具有固定值和少量常量标签。
  - 创建指标的效率更高，特别是在频繁更新指标的情况下。
  - 适用于代码可读性要求较高的场景。

**总结**
建议根据您的具体需求选择合适的创建指标方法。

| 特性     | WithLabelValues | MustNewConstMetric |
|------|-----------------|--------------------|
| 使用方式 | 直接传入动态标签值       | 使用 Desc 结构定义动态标签   |
| 适用场景 | 复杂指标，动态值或大量标签   | 简单指标，固定值和少量常量标签    |
| 优势 | 更灵活，易于捕获各种属性和变化 | 创建效率更高，代码可读性更好     |
| 劣势 | 创建效率较低          | 灵活度较低 |

- 如果您需要创建更复杂指标，具有动态值或大量标签，并且需要根据特定标签组合进行细粒度分析，那么请使用 WithLabelValues。
- 如果您需要创建简单指标，具有固定值和少量常量标签，并且更关心代码的可读性和创建效率，那么请使用 MustNewConstMetric。

### 分析MustNewConstMetric源码
> 处理较多的指标时，性能快，只做一些拼接的动作

MustNewConstMetric收集metric的思路想对简单
- 校验label是否合法，收集的label与desc的label比对；
- 声明空指标；
- 制作metric格式的label并填充到声明的指标当中；
``` 
func NewConstMetric(desc *Desc, valueType ValueType, value float64, labelValues ...string) (Metric, error) {
	if desc.err != nil {
		return nil, desc.err
	}

  // 校验labelValues的长度和Desc中的labels是否一致，不一致则返回错误
	if err := validateLabelValues(labelValues, len(desc.variableLabels)); err != nil {
		return nil, err
	}

  // 声明空指标
	metric := &dto.Metric{}
  // 填充指标，首先制作desc中用于收集metrics的label，拼成一个完整的metric。
	if err := populateMetric(valueType, value, MakeLabelPairs(desc, labelValues), nil, metric); err != nil {
		return nil, err
	}

	return &constMetric{
		desc:   desc,
		metric: metric,
	}, nil
}
```

### 分析WithLabelValues源码
> 处理较多的指标时，性能低，需要做hash计算，消耗cpu；

收集metric相对复杂
- 校验label是否合法，收集的label与desc的label比对；
- 对label进行hash（建立label的唯一值）
- 通过hash值 
- 获取label
``` 
func (v *GaugeVec) WithLabelValues(lvs ...string) Gauge {
	g, err := v.GetMetricWithLabelValues(lvs...)
	if err != nil {
		panic(err)
	}
	return g
}
```
针对label value进行hash，返回hash值
> 将标签值转换为唯一的哈希值，以便高效地存储和检索指标。

``` 
func (m *MetricVec) hashLabelValues(vals []string) (uint64, error) {
	// 校验labelValues的长度和Desc中的labels是否一致，不一致则返回错误
  if err := validateLabelValues(vals, len(m.desc.variableLabels)-len(m.curry)); err != nil {
		return 0, err
	}

	var (
		h             = hashNew()
		curry         = m.curry
		iVals, iCurry int
	)

  // 遍历指标描述 (m.desc.variableLabels) 中定义的所有变量标签。
	for i := 0; i < len(m.desc.variableLabels); i++ {
  // 检查 curry 中是否存在与当前变量标签匹配的预定义标签值
		if iCurry < len(curry) && curry[iCurry].index == i {
  // 将当前哈希值 (h) 与标签值的哈希值相加。
			h = m.hashAdd(h, curry[iCurry].value)
			iCurry++
		} else {
			h = m.hashAdd(h, vals[iVals])
			iVals++
		}
  // 将当前哈希值 (h) 与分隔符字节的哈希值相加（用于区分标签）。
		h = m.hashAddByte(h, model.SeparatorByte)
	}
	return h, nil
}
```
根据hash值来获取metric
``` 
func (m *metricMap) getOrCreateMetricWithLabelValues(
	hash uint64, lvs []string, curry []curriedLabelValue,
) Metric {
	m.mtx.RLock()
  // 如果获取到直接返回
	metric, ok := m.getMetricWithHashAndLabelValues(hash, lvs, curry)
	m.mtx.RUnlock()
	if ok {
		return metric
	}

	m.mtx.Lock()
	defer m.mtx.Unlock()
  // 获取不到则创建
	metric, ok = m.getMetricWithHashAndLabelValues(hash, lvs, curry)
	if !ok {
		inlinedLVs := inlineLabelValues(lvs, curry)
    // 创建metric，如xx{aa=bb...}
		metric = m.newMetric(inlinedLVs...)
    // 对hash后的label值做完索引进行赋值。
		m.metrics[hash] = append(m.metrics[hash], metricWithLabelValues{values: inlinedLVs, metric: metric})
	}
	return metric
}
```
### 源码分析后的总结
- MustNewConstMetric：无脑拼接metric，用于静态label，后续不会动态变化的；
- WithLabelValues：会对label进行hash，作为索引 会将label存到哈希的数据结构，从哈希的数据结构中根据hash取出metirc，如果不存在则创建并返回。这意味着整个 metricMap 使用哈希映射进行组织以实现高效检索。