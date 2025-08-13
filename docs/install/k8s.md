# 安装流程

::: tip 提示
在安装之前请确保您已经存在`Kubernetes`集群；
:::

## 安装步骤如下
### 克隆项目
- 有网络条件的可以直接`Clone`。
- 没有网络条件可以下载`ZIP`包，导入到服务器上。
  ![img.png](img/img.png)

### 进入项目目录
``` 
# cd WatchAlert-master/deploy/helmchart
```

### 启动服务
> 默认启动配置中`MySQL` `Redis`是没有持久化的，生产上建议启用持久化，或使用内部中间件;
``` 
# helm install -n observability watchalert .
```

### 访问项目
``` 
export NODE_PORT=$(kubectl get --namespace observability -o jsonpath="{.spec.ports[0].nodePort}" services watchalert-web)
export NODE_IP=$(kubectl get nodes --namespace observability -o jsonpath="{.items[0].status.addresses[0].address}")
echo http://$NODE_IP:$NODE_PORT
```
- 登陆页初始化`admin`密码.