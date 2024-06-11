# 安装流程

::: tip 提示
在安装之前请确保您已经正确安装并启动`Docker`服务 和`docker-compose`指令；
:::

安装步骤如下

## 目录结构
```yaml
[root@master01 w8t]# tree
.
├── config
│   └── config.yaml
└── docker-compose.yaml

1 directory, 2 files
```
## 配置文件

- [config.yaml](https://github.com/w8t-io/WatchAlert/blob/master/config/config.yaml)

## Docker-Compose
> 注意：w8t-web 的 command。
>
> REACT_APP_BACKEND_PORT=9001 yarn start
>
> 参数解析：
>
> - REACT_APP_BACKEND_PORT：有特殊需要需要修改后端端口，需要在这里指定后端端口。

- [docker-compose.yaml](https://github.com/w8t-io/WatchAlert/blob/master/deploy/docker-compose/docker-compose.yaml)


## 启动项目
```shell
# docker-compose -f docker-compose.yaml up -d
# docker-compose -f docker-compose.yaml ps
   Name                  Command               State                 Ports              
----------------------------------------------------------------------------------------
w8t-mysql     docker-entrypoint.sh mysqld      Up      0.0.0.0:3306->3306/tcp, 33060/tcp
w8t-redis     docker-entrypoint.sh redis ...   Up      6379/tcp                         
w8t-service   /app/watchAlert                  Up      0.0.0.0:9002->9001/tcp           
w8t-web       /bin/sh -c REACT_APP_BACKE ...   Up      0.0.0.0:80->3000/tcp      
```

## 初始化数据
- [Init SQL](https://github.com/w8t-io/WatchAlert/blob/master/deploy/sql/README.md)