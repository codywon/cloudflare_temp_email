# cfmail-frontend 部署说明

当前目录不再使用 Cloudflare Pages Project 部署，而是使用 Worker + Assets 方式部署到 `cfmail-frontend`。

## 当前结构
- Worker 入口: `pages/worker.js`
- 静态资源: `frontend/dist`
- 后端服务绑定: `BACKEND -> cfmail-api`
- 运行配置: `pages/wrangler.toml`

## 部署命令
先构建前端：

```bash
cd frontend
npm run build
```

再部署前端 Worker：

```bash
cd ../pages
npx wrangler deploy
```

## 本地调试
```bash
cd pages
npx wrangler dev
```

## 注意
- 不要再使用 `wrangler pages deploy`
- 不要把 `BACKEND` 指到测试 Worker
- 当前正式前端域名为 `mail.new520.cc`
- 当前正式后端服务为 `cfmail-api`
- 邮箱、邮件等数据都在后端/D1，前端部署不会清空这些数据
