# 安装流程

::: tip 提示
在安装之前请确保您已经存在`Kubernetes`集群；
:::

安装步骤如下

## ConfigMap
> cm.yaml
```yaml 
apiVersion: v1
kind: ConfigMap
metadata:
  name: watchalert
  namespace: default
data:
  config.yaml: |
    Server:
      port: "9001"
      # 定义相同的Group之间发送告警通知的时间间隔(s), 组内有告警就一起发出, 没有则单独发出.
      # 第一次产生的告警, 等待10s（为了防止在等待期间,还没有推送告警消息期间这时告警消失了触发了恢复消息）
      groupWait: 10
      # 第二次产生的告警, 等待120s（为了保证告警聚合性相同时间段的告警一起发送）
      groupInterval: 120
      # 告警恢复等待时间，1m（为了防止在告警触发恢复后紧接着再次触发告警条件）
      recoverWait: 1

    MySQL:
      host: 127.0.0.1
      port: 3306
      user: root
      pass: semaik1023
      dbName: watchalert
      timeout: 10s

    Redis:
      host: 127.0.0.1
      port: 6379
      pass: ""

    Jwt:
      # 失效时间
      expire: 18000 
```

## Deployment
> deploy.yaml
```yaml
 # 注意：watchalert-service 暂不支持多副本
 ---
 apiVersion: apps/v1
 kind: Deployment
 metadata:
   labels:
     name: watchalert-service
   name: watchalert-service
   namespace: default
 spec:
   replicas: 1
   selector:
     matchLabels:
       app: watchalert-service
   template:
     metadata:
       labels:
         app: watchalert-service

     spec:
       containers:
         - name: watchalert-service
           image: docker.io/cairry/watchalert:latest
           imagePullPolicy: IfNotPresent
           ports:
             - containerPort: 9001
               name: http
               protocol: TCP

           resources:
             limits:
               cpu: "1"
               memory: 2G
             requests:
               cpu: 100m
               memory: 100M

           livenessProbe:
             failureThreshold: 3
             httpGet:
               path: /hello
               port: 9001
               scheme: HTTP
             initialDelaySeconds: 10
             periodSeconds: 10
             successThreshold: 1
             timeoutSeconds: 1
           readinessProbe:
             failureThreshold: 1
             httpGet:
               path: /hello
               port: 9001
               scheme: HTTP
             initialDelaySeconds: 10
             periodSeconds: 5
             successThreshold: 1
             timeoutSeconds: 1

           volumeMounts:
             - mountPath: /app/config/config.yaml
               name: config
               subPath: config.yaml
             - mountPath: /etc/localtime
               name: host-time

       volumes:
         - configMap:
             defaultMode: 420
             name: watchalert
           name: config
         - hostPath:
             path: /etc/localtime
             type: ""
           name: host-time

 ---
 apiVersion: apps/v1
 kind: Deployment
 metadata:
   labels:
     name: watchalert-web
   name: watchalert-web
   namespace: default
 spec:
   replicas: 1
   selector:
     matchLabels:
       app: watchalert-web
   template:
     metadata:
       labels:
         app: watchalert-web

     spec:
       containers:
         - name: watchalert-web
           image: docker.io/cairry/watchalert-web:latest
           imagePullPolicy: IfNotPresent
           ports:
             - containerPort: 80
               name: http
               protocol: TCP

           resources:
             limits:
               cpu: "1"
               memory: 2G
             requests:
               cpu: 100m
               memory: 100M

           volumeMounts:
             - mountPath: /etc/nginx/conf.d/w8t.conf
               name: nginx-config
               subPath: w8t.conf
             - mountPath: /etc/localtime
               name: host-time

       volumes:
         - configMap:
             defaultMode: 420
             name: watchalert
           name: nginx-config
         - hostPath:
             path: /etc/localtime
             type: ""
           name: host-time
```

## Service
> svc.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: watchalert-service
  namespace: default
  labels:
    name: watchalert-service
spec:
  ports:
    - name: watchalert-service
      protocol: TCP
      port: 9001
      targetPort: 9001
      nodePort: 30901
  selector:
    app: watchalert-service
  type: NodePort

---
apiVersion: v1
kind: Service
metadata:
  name: watchalert-web
  namespace: default
  labels:
    name: watchalert-web
spec:
  ports:
    - name: watchalert-web
      protocol: TCP
      port: 3000
      targetPort: 3000
      nodePort: 30300
  selector:
    app: watchalert-web
  type: NodePort
```

## 一键部署
```yaml
kubectl apply -f ./cm.yaml -f ./deploy.yaml -f svc.yaml
```

## 初始化数据
- [Init SQL](https://github.com/w8t-io/WatchAlert/blob/master/deploy/sql/README.md)