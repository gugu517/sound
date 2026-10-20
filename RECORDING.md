# 实车测试记录

1. 停车时打开网站，选择 GPS 驾驶，启动引擎并允许定位。
2. 点右上角圆点，点“开始记录”。关闭弹窗，红点常亮表示正在记录。
3. 测试完成停车后，再点圆点 → 停止并保存 → JSON，或点“上传仓库”直接上传 JSON。上传需要临时 GitHub Token，仅授权 sound 仓库的 Contents 读写权限即可；Token 不保存。上传到公开仓库时默认去掉经纬度、海拔和方向，可主动勾选包含位置数据。

## 本地保存

数据仅保存在当前浏览器、当前网站的 IndexedDB，每秒提交一批。刷新后可在测试记录列表找到已保存内容；异常退出的记录会标为未正常结束。不会自动恢复录制，需手动开始新记录。清除站点数据会永久删除记录，异常关机或浏览器强制终止可能丢失最后尚未提交的数据。记录包含经纬度，不会自动上传，只有点击上传按钮才会发送至 GitHub。不会自动删除历史记录。

记录本身不额外申请定位；定位由 GPS 引擎驱动。演示模式也可记录，但没有真实 GPS 数据。

## JSON 格式 sound.drive-log/1

- session：开始结束时间、浏览器环境、屏幕、时区、初始配置和事件数量。
- events：按接收顺序保存的 gps、telemetry、gpsError、settings、marker、visibility、start、stop、pagehide 事件。
- wallMs：事件接收时的本机 Unix 时间，毫秒。elapsedMs：相对此次记录开始的单调时钟，毫秒，适合计算间隔。
- gps：浏览器原始回调，包含 gpsTimestampMs、gpsReceivedMonoMs、gpsIntervalMs、gpsAgeMs 和 coords。coords.speed 原样保留，可能为 null；速度单位 m/s，经纬度为度，accuracy/altitude 为米。
- telemetry：约 10 Hz，包含输出车速 outputSpeedMps、实际显示车速 displaySpeedKmh、输出加速度 outputAccelerationMps2、rpm、gear、load、gpsStatus，以及配置。
- gpsBaseSpeedMps：当前定位处理后的基础速度；gpsAccelerationMps2：差分并平滑的加速度；extrapolatedSpeedMps：按当前实现计算的外推目标；gpsAgeMs：距离最近处理定位的单调时钟间隔。
- GPS 回调中 gpsAgeMs 则是本机接收时间减定位时间戳，可能受设备时钟偏差影响，不能直接视为绝对定位延迟。
- marker：用户点击标记的时间点，便于与主观感受对应。

上传文件存储在 test-data/，格式为 JSON。上传前会移除位置字段（除非手动勾选包含位置数据）。本地 JSON 导出保留完整字段。

## 分析边界

GPS 原始速度与本应用计算值可以用于分析回调间隔、掉点、抖动和滤波外推行为，但不是车辆真实速度的独立基准。要量化与车速表的绝对偏差、响应延迟，需提供时间可对齐的仪表记录或其他参考设备数据。
