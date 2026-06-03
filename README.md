# VACG

本项目是一个基于 Vue 3 + Node.js 的在线动漫网站，通过爬虫技术从 AGE 动漫获取资源，并使用 Bootstrap 5 实现了全屏幕尺寸适配。

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 开发模式（同时启动前端 + API 服务）
npm run dev

# 3. 浏览器访问
#    前端: http://localhost:5173
#    API:  http://localhost:3000
```

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装所有依赖（前端 + 后端） |
| `npm run dev` | 开发模式：并行启动 Vite 前端 (5173) 和 API 服务 (3000) |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 预览生产构建 |

## 项目结构

```
VACG/
├── public/              # 静态资源
│   ├── fufu.mp4         # 首页视频横幅
│   └── not-found.png    # 封面加载失败占位图
├── src/
│   ├── api/
│   │   ├── index.js     # 前端 API 封装（fetch 调用）
│   │   └── server.cjs   # 后端 Express 爬虫服务
│   ├── components/      # 公共组件
│   │   ├── AnimeCard.vue       # 番剧卡片（封面 + 名称）
│   │   ├── NavBar.vue          # 导航栏（含搜索、小屏弹窗）
│   │   ├── RecentUpdates.vue   # 最近更新区块
│   │   ├── TodayRecommends.vue # 今日推荐区块
│   │   ├── VideoBanner.vue     # 首页视频横幅 + 动态 Logo
│   │   └── WeeklySchedule.vue  # 本周放送列表
│   ├── views/           # 页面视图
│   │   ├── Home.vue           # 首页
│   │   ├── Catalog.vue        # 目录（筛选 + 分页）
│   │   ├── Detail.vue         # 番剧详情 + 相关推荐
│   │   ├── Play.vue           # 视频播放页
│   │   ├── Rank.vue           # 排行榜（周/月/总）
│   │   ├── Search.vue         # 搜索结果
│   │   ├── WeeklyUpdate.vue   # 一周更新
│   │   └── NotFound.vue       # 404 页面
│   ├── router/index.js  # 路由配置
│   ├── style.css        # 全局样式
│   ├── App.vue          # 根布局
│   └── main.js          # 入口文件（挂载 Bootstrap + Router）
├── index.html
├── vite.config.js       # Vite 配置（含 API 代理）
└── package.json
```

## API 接口

后端服务运行在 `http://localhost:3000`，以下接口由 Vite 代理转发。

| 端点 | 说明 |
|------|------|
| `GET /api/update` | 最近更新 |
| `GET /api/recommend` | 今日推荐 |
| `GET /api/weekly` | 本周放送列表 |
| `GET /api/detail/:id` | 番剧详情（含剧集 + 相关推荐） |
| `GET /api/play/:id/:source/:ep` | 视频 iframe 地址 + 封面 + 信息 |
| `GET /api/search?query=xxx&page=1` | 搜索番剧 |
| `GET /api/catalog?segment=xxx&page=1` | 目录筛选（含筛选标签） |
| `GET /api/rank` | 排行榜（周榜/月榜/总榜） |
| `GET /api/update-page` | 一周更新页面数据 |

## 主题色

项目使用渐变色主题：`linear-gradient(65deg, #ff5e95, #3cc8f5)`

- 按钮、标签、选中态均使用该渐变
- `style.css` 中汇集了 Bootstrap 主题覆盖和全局样式

## 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | Vue 3 (Composition API) |
| 路由 | Vue Router 4 |
| UI 框架 | Bootstrap 5 + Bootstrap Icons |
| 构建工具 | Vite |
| 后端 | Express 4 |
| 爬虫 | axios + cheerio |
| 并行启动 | concurrently |
