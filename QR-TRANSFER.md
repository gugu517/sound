# 车机二维码传到手机

## 使用

1. 车机保持原网址 https://gugu517.github.io/sound/ ，正常刷新后打开右上角测试记录。
2. 对已保存的记录点“传到手机”。不要清除站点数据。
3. 手机用相机扫描入口二维码，使用 Safari / Chrome 打开 https://gugu517.github.io/sound/receive.html ，点“打开相机”并允许权限。
4. 车机选择“调校包”或“完整记录”，选择是否包含位置数据，点“生成数据码”，再点“播放数据码”。
5. 手机持续对准车机屏幕。接收进度达到 100% 且显示“SHA-256 校验通过”后，在手机点“保存 JSON”或“分享文件”。

播放会循环。漏帧在下一轮自动补齐，手机显示前十个缺失帧号；可在车机暂停并跳转到指定帧。手机刷新后能恢复已经提交的接收分片。重新生成相同内容时压缩结果确定，能继续补扫；改变传输模式或位置选项会成为另一份传输，需先保存并清空旧接收缓存。

扫码本身不访问上传后端，不需要上传密码或 GitHub Token。双方打开页面时需要加载 GitHub Pages 的本地资源，之后数据通过屏幕与相机传递，不会自动上传。原车机记录不修改、不删除。

如果浏览器相机不可用，可以先使用手机相机拍摄完整一轮数据码录像，再在接收页“相机无法使用 / 从录像接收”选择录像。录像中的缺帧仍需后续补扫；无法修复反光、模糊或完全未拍到的帧。此选项需要手机浏览器能播放所选视频编码。

## 数据模式

- 调校包：保留全部原始 GPS 和非 telemetry 事件；telemetry 至多每 500ms 一条（2Hz），额外保留停止状态。适合先分析回调间隔、定位漂移和速度趋势。transfer 元数据声明抽样方式、原始数量和所选数量。
- 完整记录：保留全部事件（包括原来的约 10Hz 遥测），传输时间更长。用于分析更细的滤波与响应过程。
- 位置选项：默认包含经纬度，适合在本人手机进行本地分析；关闭时移除经纬度、海拔及方向。请勿把包含位置数据的二维码或录像公开。

页面按实际压缩大小显示每轮预计时长；拍摄中可能漏帧，因此实际接收时长可能超过一轮。标准播放每帧 0.4 秒，识别不稳定时可切换慢速。该估计不包含人工操作、校验或保存耗时。

## 格式 SQR1

JSON UTF-8 → gzip（固定 mtime=0）→ 720 字节分片 → Base45 → QR Alphanumeric，纠错级别 M。

每帧包含版本、完整压缩包 SHA-256、分片下标和总数、压缩/原始长度、当前分片 CRC32、分片内容。支持乱序、重复帧忽略及循环补收。全部分片收齐后校验 SHA-256、受限解压和 JSON schema；没有完整性通过的结果不会标为成功。

手机使用独立 IndexedDB `sound-qr-receive` 版本 1；原车机 `sound-drive-tests` 版本 1 和 sessions/chunks 不变。

上限：原始 JSON 50MB、压缩包 20MB。二维码不是加密信道，完整性校验不验证拍摄对象身份；只扫描自己的车机。手机“清空接收缓存”只清空手机副本。

## 构建及许可

页面无 CDN 依赖。源文件：assets/qr-transfer.source.js、assets/qr-codec.source.js。

```
npm install --no-save qrcode-generator@1.4.4 jsqr@1.4.0 fflate@0.8.2 esbuild@0.25.12
npx esbuild assets/qr-transfer.source.js --bundle --format=iife --global-name=SoundQRTransfer --minify --target=chrome80,safari14 --outfile=assets/qr-transfer.js
```

第三方库：qrcode-generator 1.4.4、jsQR 1.4.0、fflate 0.8.2，MIT 许可文件见 assets/vendor/。来源：https://github.com/kazuhikoarase/qrcode-generator 、https://github.com/cozmo/jsQR 、https://github.com/101arrowz/fflate 。

## 验证边界

已使用浏览器生成的二维码视频流验证手机接收逻辑、漏帧补收、刷新恢复与 JSON 一致性，并用模拟的 2064 条 GPS 记录验证完整传输和抽样保留。真实车机屏幕反光、手机镜头对焦和系统浏览器相机权限仍需实测。
