# relabel_config和metric_relabel_configs常用配置
## relabel_configs
`relabel_configs`用于在`Prometheus`从目标抓取数据时，重新定义和调整标签。它在数据被抓取并被存储之前生效，主要用于动态发现目标和调整标签格式。

用途
- 过滤目标：可以通过标签过滤掉某些不需要监控的目标。
- 修改目标标签：在抓取数据前对目标的标签进行增删改。
- 替换抓取目标：更改或设置 Prometheus 实际抓取的地址。

常见配置字段
- `source_labels`: 指定要使用的标签列表，标签值将被合并并用于后续操作。
- `regex`: 使用正则表达式来匹配和替换标签值。
- `action`: 指定 `relabel` 动作（`replace`, `keep`, `drop`, `hashmod`, `labelmap`, `labeldrop`, `labelkeep`）。
- `target_label`: 要修改的目标标签。
- `replacement`: 替换标签的值。
- `separator`: 合并多个标签值时的分隔符。

### source_labels
读取源labels

**语法**
``` 
[ source_labels: '[' <labelname> [, ...] ']' ]
```
**案例**
``` 
- source_labels: [__address__]
```

### separator
连接多个资源标签的分隔符

**语法**
``` 
[ separator: <string> | default = ; ]
```
**案例**
``` 
      - action: replace
        replacement: $1
        separator: /
        source_labels:
        - namespace
        - app
        target_label: job
        
# 结果是 job = namespace/app
```
### target_label
将替换结果写入到目标标签

**语法**
``` 
[ target_label: <labelname> ]
```

**案例**
``` 
target_label: __address__
```

### regex

对原标签进行分割的正则表达式匹配

**语法**
``` 
[ regex: <regex> | default = (.*) ]
```

**案例**
``` 
regex: '(.*):3002'

regex: '(.*):(3002|3011)'
```

### replacement
按正则分割后的结果进行模版的替换，会根据这个模版生成替换结果

**语法**
``` 
[ replacement: <string> | default = $1 ]
```

**案例**
``` 
- source_labels: [__address__]
  separator: ;
  regex: '.*:(.*)'
  target_label: __service_port__
  replacement: $1
  action: replace
```


### 基于正则表达式匹配执行的操作

#### replace
**默认行为**，不配置action的话就采用这种行为，它会根据regex来去匹配source_labels标签上的值，并将并将匹配到的值写入target_label中

**案例**
>会将labels中的“__hostname__”替换为“node_name”
``` 
    relabel_configs:
    - source_labels:
      - "__hostname__"
      regex: "(.*)"
      target_label: "node_name"
      action: replace
      replacement: $1
```

#### keep
仅收集匹配到regex的源标签，而会丢弃没有匹配到的所有标签，用于选择。

**案例**
>只要指标的“__meta_consul_dc”标签的值含有“dc1”，就保留这个指标。
``` 
    relabel_configs:
    - source_labels:  ["__meta_consul_dc"]
      regex: "dc1"
      action: keep
```

#### drop
丢弃匹配到regex的源标签，而会收集没有匹配到的所有标签，用于排除

**案例**
>只要指标中“__meta_consul_dc”标签的值含有"dc1"，就会删除该指标。
``` 
    relabel_configs:
    - source_labels:  ["__meta_consul_dc"]
      regex: "dc1"
      action: drop
```

#### hashmod
使用`hashmod`操作将`source_labels`的哈希值（取模结果）设置为`target_label`。

`modulus`指定模数，用于对哈希值进行取模操作。这里设置为 10，表示结果将是 0 到 9 之间的一个整数。

**案例**
```angular2html
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance_hashmod
        modulus: 10
        action: hashmod
```

#### labelmap
`regex`与所有原标签做匹配，并且将捕获到的内容作为为新的标签名称，通过`replacement`替换值。

**案例**
>将labels的标签 __xxx__的标签加入到promethus中labels，这样可以在收集时使用该标签。
```
  - job_name: "nodes"
    static_configs:
      - targets:
        - 192.168.88.202:9100
        labels:
          __hostname__: node02
          __region_id__: "beijing"
          __zone__: b
    relabel_configs:
    - regex: "__(.*)__"
      action: labelmap
```

#### labeldrop
`regex`与所有原标签做匹配。任何匹配的标签将从标签集中删除。

**案例**
``` 
relabel_configs:
  - regex: label_should_drop_(.+)
    action: labeldrop
```

#### labelkeep
`regex`与所有原标签做匹配。只保留匹配的标签集。

**语法**
``` 
[ action: <relabel_action> | default = replace ]
```

**案例**
``` 
action: labelkeep
```

## metric_relabel_configs
`metric_relabel_configs` 在数据被抓取并存储到时序数据库之前进行重新标签化。这允许在写入数据库之前对时间序列进行处理和过滤。

**用途**
- 过滤时间序列：可以删除某些不需要存储的时间序列。
- 优化存储：通过删除不必要的标签来减少存储需求。
- 调整标签：可以为时间序列调整或生成新标签。

**常见配置字段**

与 `relabel_configs` 类似，`metric_relabel_configs` 使用相同的字段，只是作用于不同的处理阶段。

**配置示例**
``` 
scrape_configs:
  - job_name: 'example'
    static_configs:
      - targets: ['localhost:9090']

    metric_relabel_configs:
      # 删除掉所有以"temp_"开头的标签
      - source_labels: [__name__]
        action: drop
        regex: 'temp_.*'

      # 将`instance`标签值改为`host`
      - source_labels: [instance]
        target_label: host
        action: replace
        regex: '(.*)'
        replacement: '$1'

      # 删除掉所有没有"job"标签的时间序列
      - source_labels: [job]
        action: drop
        regex: ''
```

参考文档
- [Kubernetes 集群监控配置必读_时间序列数据库 TSDB-阿里云帮助中心](https://help.aliyun.com/document_detail/123394.html?utm_content=g_1000230851&spm=5176.20966629.toubu.3.f2991ddcpxxvD1#h3-service)
- https://www.prometheus.wang/sd/service-discovery-with-relabel.html
- https://www.orchome.com/9884
- https://github.com/prometheus/prometheus/blob/main/documentation/examples/prometheus-kubernetes.yml