# 声浪仪表盘

面向横屏车机的纯黑声浪仪表盘，提供 18 款合成声浪、演示/GPS 模式、加速数字张力、边缘光影和随速度变化的 Three.js 流光背景。

## 本地预览

需要 Python 3。双击 `start.bat`，或执行 `python serve.py`，访问 http://127.0.0.1:8766/。

## GitHub Pages

仓库 Settings → Pages → Build and deployment 选择 GitHub Actions，然后运行 Deploy Pages 工作流。所有界面资源本地托管，支持仓库子路径。

## 当前限制

- 现有声浪引擎和 AudioWorklet 来自 tslbox.top 的公开前端，域名配置已补充 gugu517.github.io；主引擎与工作线程使用一致的部署域名。迁移到其他域名时需要同步配置。
- GPS 需要 HTTPS 和定位权限，尚未在 ES6 实车验证，无法直接读取车辆 CAN 总线车速。
- 不包含支付、打赏功能。声音为程序合成。

## 第三方来源

界面、仪表交互及流光逻辑为本项目调整；声浪引擎源自 tslbox.top，未附带明确的再分发授权声明。第三方动画库许可见 `assets/vendor/`，其中 Anime.js 与 Three.js 使用 MIT 许可。不能将整个项目视为已获 MIT 授权。

## 测试数据记录

右上角圆点可开始/停止本地记录，上传至本仓库或导出 JSON。说明与字段见 [RECORDING.md](RECORDING.md)。默认不记录、不上传。

上传服务：https://sound-upload-gugu517.guguc6877.chatgpt.site 。Token 仅在电脑端的一次性配置页设置，并在服务端加密保存；车机输入上传密码。更新不迁移本地记录库。

## 不依赖上传后端的数据取回

记录列表的“传到手机”可显示连续二维码，手机在 [接收页](https://gugu517.github.io/sound/receive.html) 收齐并校验后保存或分享 JSON。支持调校包与完整记录。详见 [QR-TRANSFER.md](QR-TRANSFER.md)。
