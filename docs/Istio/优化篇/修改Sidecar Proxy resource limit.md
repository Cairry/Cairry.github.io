# 修改istio sidecar proxy资源请求/限制

有两种方式均可完成对sidecar资源限制的修改，注入模版适用于刚开始添加sidecar需求时注入，已完成注入的可以通过控制器中的`annotations`操作。

## 1. 注入模版

在注入 Proxy 时修改resource资源限制。

```
  containers:
  - name: istio-proxy
…
    resources:
      limits:
        [[ if (isset .ObjectMeta.Annotations `sidecar.istio.io/proxyLimitsCPU`) -]]
        cpu: "[[ index .ObjectMeta.Annotations `sidecar.istio.io/proxyLimitsCPU` ]]"
        [[ else -]]
        cpu: 200m
        [[ end ]]
        [[ if (isset .ObjectMeta.Annotations `sidecar.istio.io/proxyLimitsMemory`) -]]
        memory: "[[ index .ObjectMeta.Annotations `sidecar.istio.io/proxyLimitsMemory` ]]"
        [[ else -]]
        memory: 256Mi
        [[ end ]]
      requests:
        [[ if (isset .ObjectMeta.Annotations `sidecar.istio.io/proxyRequestsCPU`) -]]
        cpu: "[[ index .ObjectMeta.Annotations `sidecar.istio.io/proxyRequestsCPU` ]]"
        [[ else -]]
        cpu: 100m
        [[ end ]]
        [[ if (isset .ObjectMeta.Annotations `sidecar.istio.io/proxyRequestsMemory`) -]]
        memory: "[[ index .ObjectMeta.Annotations `sidecar.istio.io/proxyRequestsMemory` ]]"
        [[ else -]]
       memory: 128Mi
        [[ end ]]
```

## 2. 自定义

如果注入的服务是应用网关层/流量较大的，必须优化此项。流量过大的情况下资源消耗会比较高。

```
spec:
  ···
  template:
    metadata:
      ···
      annotations:
        sidecar.istio.io/proxyRequestsCPU: "200m"
        sidecar.istio.io/proxyRequestsMemory: "512Mi"
        sidecar.istio.io/proxyLimitsCPU: "300m"
        sidecar.istio.io/proxyLimitsMemory: "2Gi"
```



## 2. 参考

https://github.com/istio/istio/issues/16126
