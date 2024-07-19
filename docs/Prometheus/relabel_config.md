# relabel_config常用配置

## source_labels
读取源labels

**语法**
``` 
[ source_labels: '[' <labelname> [, ...] ']' ]
```
**案例**
``` 
- source_labels: [__address__]
```

## separator
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
## target_label
将替换结果写入到目标标签

**语法**
``` 
[ target_label: <labelname> ]
```

**案例**
``` 
target_label: __address__
```

## regex

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

## replacement
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


## 基于正则表达式匹配执行的操作

### replace
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

### keep
仅收集匹配到regex的源标签，而会丢弃没有匹配到的所有标签，用于选择。

**案例**
>只要指标的“__meta_consul_dc”标签的值含有“dc1”，就保留这个指标。
``` 
    relabel_configs:
    - source_labels:  ["__meta_consul_dc"]
      regex: "dc1"
      action: keep
```

### drop
丢弃匹配到regex的源标签，而会收集没有匹配到的所有标签，用于排除

**案例**
>只要指标中“__meta_consul_dc”标签的值含有"dc1"，就会删除该指标。
``` 
    relabel_configs:
    - source_labels:  ["__meta_consul_dc"]
      regex: "dc1"
      action: drop
```

### hashmod
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

### labelmap
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

### labeldrop
`regex`与所有原标签做匹配。任何匹配的标签将从标签集中删除。

**案例**
``` 
relabel_configs:
  - regex: label_should_drop_(.+)
    action: labeldrop
```

### labelkeep
`regex`与所有原标签做匹配。只保留匹配的标签集。

**语法**
``` 
[ action: <relabel_action> | default = replace ]
```

**案例**
``` 
action: labelkeep
```

参考文档
- [Kubernetes 集群监控配置必读_时间序列数据库 TSDB-阿里云帮助中心](https://help.aliyun.com/document_detail/123394.html?utm_content=g_1000230851&spm=5176.20966629.toubu.3.f2991ddcpxxvD1#h3-service)
- https://www.prometheus.wang/sd/service-discovery-with-relabel.html
- https://www.orchome.com/9884
- https://github.com/prometheus/prometheus/blob/main/documentation/examples/prometheus-kubernetes.yml