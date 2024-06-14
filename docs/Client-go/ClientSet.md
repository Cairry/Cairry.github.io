## 简介
Clientset 是一个包含了许多 Kubernetes API 操作方法的接口集合，它封装了与 Kubernetes API 服务器通信的底层细节，`常用于对 Kubernetes 内部资源进行操作`。

以下是一些 Clientset 的常见用途和功能：

1. 创建、更新、删除 Kubernetes 资源：通过 Clientset 可以方便地执行对资源的增删改操作，如创建 Pod、Service、Deployment 等。
2. 查询和获取 Kubernetes 资源信息：可以使用 Clientset 查询特定资源的详细信息，例如获取所有 Pod 的列表。
3. Watch 操作：通过 Clientset 可以实现对资源的 Watch 操作，监控资源的变更并及时做出响应。
4. 执行自定义操作：可以使用 Clientset 执行自定义的 Kubernetes API 操作，实现更灵活的功能。

在使用 Clientset 时，通常需要首先创建一个 Clientset 的实例，然后通过该实例调用相应的方法来操作 Kubernetes 资源。Clientset 提供了许多方法来简化与 Kubernetes API 的交互，使开发人员可以更高效地编写 Kubernetes 相关的应用程序和控制器。

## 源码
建立Client
```golang
func GetKubeConfig() *string {
	var kubeconfig *string
	
	if home := homedir.HomeDir(); home != "" {
		kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
	} else {
		kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	}

	flag.Parse()

	return kubeconfig
}

func NewClientSet(kubeConfig *string) *kubernetes.Clientset {
	config, err := clientcmd.BuildConfigFromFlags("", *kubeConfig)
	if err != nil {
		panic(err.Error())
	}

	cs, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	return cs
}
```

查询k8s所有节点
```golang
func main() {
	client := client2.NewClientSet(getKubeConfig())
	list, err := client.CoreV1().Nodes().List(context.TODO(), v1.ListOptions{})
	if err != nil {
		log.Errorf(err.Error())
		return
	}
	
	for _, v := range list.Items {
	    fmt.println(v.Name)
	}
}
```