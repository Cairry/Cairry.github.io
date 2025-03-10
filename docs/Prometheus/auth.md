# Prometheus 配置 Basic Auth
## 哈希密码
```
# yum install -y httpd-tools

# htpasswd -nBC 12 '' | tr -d ':\n'
New password: admin
Re-type new password: admin
$2y$12$LIrVJdQQr7v5RlyCpJ.XL.aaLIm42yvl6rcu/l5nGUW9.kiosRVYC
```

## 创建 auth 配置
``` 
./auth.yaml

basic_auth_users:
    admin: $2y$12$LIrVJdQQr7v5RlyCpJ.XL.aaLIm42yvl6rcu/l5nGUW9.kiosRVYC
```

## 添加启动配置
``` 
prometheus --web.config.file=auth.yml
```

## 测试
``` 
# curl --head http://localhost:9090/graph
401 Unauthorized
```
由于未能提供有效的用户名和密码，因此这将返回响应。

## 在 Target 中配置 Basic auth
``` 
scrape_configs:
  - job_name: 'your_job_name'  # 任务名称
    basic_auth:
      username: 'your_username'  # Basic Auth 用户名
      password: 'your_password'  # Basic Auth 密码
    static_configs:
      - targets: ['your_target:port']  # 目标地址
```