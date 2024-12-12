## 快照功能

`vmbackup`工具为了安全性，避免将数据备份到`storageDataPath`指定的目录，因为这个目录由`VictoriaMetrics`实时使用。进行备份时，应选择另外的目录，以免备份操作与`VictoriaMetrics`存储实时数据的操作冲突，从而可能导致数据损坏或一系列的问题。

### 命令方式创建

支持备份到指定目录

- https://docs.victoriametrics.com/vmbackup/

``` 

vmbackup -storageDataPath /var/lib/victoriametrics/ -dst fs:///backups/victoriametrics/

```

### 接口方式创建

#### 创建快照

使用`/snapshot/create`以创建快照。

```
http://<victoriametrics-addr>:8428/snapshot/create

```

快照会在存储目录下创建<-storageDataPath>/snapshots，可以使用vmbackup随时将快照存档到备份存储。


页面返回以下 JSON 响应：

```
{"status":"ok","snapshot":"<snapshot-name>"}

```

#### 删除快照

**删除单个快照**

使用`/snapshot/delete`来删除快照。

```
http://<victoriametrics-addr>:8428/snapshot/delete?snapshot=<snapshot-name>
```

>注意：
> - 不要使用rm或类似命令删除其中的子目录，因为这将导致某些快照数据未被删除。更喜欢
> - 不要使用cp或rsync类似命令复制子目录，因为这些命令很可能不会复制快照中存储的某些数据。首选使用vmbackup来制作快照数据的副本。


**删除所有快照**


使用`/snapshot/delete_all`以删除所有快照。

``` 
http://<victoriametrics-addr>:8428/snapshot/delete_all

```
#### 查看快照
使用`/snapshot/list`返回可用快照的列表。
```
http://<victoriametrics-addr>:8428/snapshot/list
```
#### 快照恢复
恢复过程可以随时中断。当`vmrestore`使用相同的参数重新启动时，它会自动从中断点恢复。

``` 
./vmrestore -src=<storageType>://<path/to/backup> -storageDataPath=<local/path/to/restore>
```

- `<storageType>://<path/to/backup>`是使用`vmbackup`制作的备份路径`vmrestore`可以从以下存储类型恢复备份：
    - `gst`：-src=`gs://<bucket>/<path/to/backup>`
    - `S3`：-src=`s3://<bucket>/<path/to/backup>`
    - `Azure Blob 存储`：-src=`azblob://<container>/<path/to/backup>`
    - `任何与 S3 兼容的存储`，例如MinIO、Ceph 或Swift。参阅这些文档。
    - `本地文件系统`：-src=`fs://</absolute/path/to/backup>`
- `<local/path/to/restore>`是将恢复数据的文件夹的路径。
