// ...existing code...
# CLIP-HUB

CLIP-HUB 是一个 monorepo 项目，包含一个用于提交下载任务的浏览器扩展（基于 Plasmo）和一个基于 Hono 封装 yt-dlp 的后端下载服务。扩展负责采集页面媒体链接并通过 API 提交到服务端，服务端执行下载并将文件保存到项目的 download/ 目录。

## TODO

- [ ] 插件简单 UI
- [ ] 项目 ICON
- [ ] 实现简单主页，展示下载任务的情况，也可以添加新任务
- [ ] 使用 Github Action 构建产物
- [ ] 编写 docker 文件
- [ ] 下载 playlist
