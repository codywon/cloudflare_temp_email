# CUSTOM_CHANGES

本文档记录当前仓库相对官方项目的**本地定制改动**与**后续同步官方更新的推荐流程**。

## 一、当前正式环境结构

- 正式前端 Worker：`cfmail-frontend`
- 正式后端 Worker：`cfmail-api`
- 正式前端域名：`https://mail.new520.cc`
- 前端部署方式：**Worker + Assets + Service Binding**
- 前端绑定：
  - `ASSETS` -> 前端静态资源
  - `BACKEND` -> `cfmail-api`

> 说明：邮箱、邮件、用户、配置等核心数据都在后端/D1 中；单独部署前端不会清空这些数据。

---

## 二、当前已做的定制改动

### 1. 品牌与标题
- 左上角品牌文案改为 `CFMail`
- 浏览器标签默认标题改为 `CFMail`

涉及文件：
- `frontend/src/views/Header.vue`
- `frontend/index.html`

### 2. 旧浏览器 / WebView 兼容提示
- 在不支持 `crypto.subtle` 的环境中，不再直接抛出 `digest` 相关底层错误
- 改为给出更明确的兼容性提示

涉及文件：
- `frontend/src/utils/index.ts`

### 3. 创建邮箱 UI 定制
- 后台创建邮箱页默认不启用前缀
- 新增“自定义子域名”输入框
- “随机子域名”和“自定义子域名”改为互斥
- 修复相关布局和间距问题

涉及文件：
- `frontend/src/views/admin/CreateAccount.vue`
- `frontend/src/views/common/Login.vue`

### 4. 自动登录链接体验优化
- 自动登录链接支持直接点击打开新标签
- 增加“复制链接”按钮

涉及文件：
- `frontend/src/views/admin/CreateAccount.vue`

### 5. 前端部署方式改造
- 不再按 Pages Project 方式部署
- 改为使用 Worker 直接托管静态资源
- API 通过 `BACKEND -> cfmail-api` 转发
- 新增 SPA fallback，支持直接访问 `/admin`、`/user` 等前端路由

涉及文件：
- `pages/wrangler.toml`
- `pages/package.json`
- `pages/worker.js`
- `pages/README_DEPLOY.md`

---

## 三、当前高冲突文件

后续同步官方更新时，这些文件最容易冲突：

- `frontend/src/views/Header.vue`
- `frontend/src/views/common/Login.vue`
- `frontend/src/views/admin/CreateAccount.vue`
- `frontend/src/utils/index.ts`
- `frontend/index.html`
- `pages/wrangler.toml`
- `pages/package.json`
- `pages/worker.js`

建议每次同步官方更新后，优先人工检查这些文件。

---

## 四、推荐 Git 维护模型

### 推荐分支
- `main`：尽量保留为接近官方的分支
- `custom-main`：你的生产定制分支

### 推荐远程
理想状态：
- `origin`：你自己的 fork
- `upstream`：官方仓库 `dreamhunter2333/cloudflare_temp_email`

### 当前本地状态
当前本地 `origin` 仍指向官方仓库，因此建议你后续在 GitHub 上先创建自己的 fork，再调整远程：

```bash
git remote rename origin upstream
git remote add origin <你的 fork 地址>
git fetch upstream
git fetch origin
```

如果你暂时还没有自己的 fork，也可以先保留现状，仅在本地使用 `custom-main` 分支维护。

---

## 五、推荐日常工作流

### 1. 在定制分支开发
```bash
git checkout custom-main
```

### 2. 完成一组改动后提交
建议提交信息使用：

```bash
custom: brand CFMail and frontend UX tweaks
custom: deploy frontend via worker assets
custom: add SPA fallback for frontend worker
```

### 3. 同步官方更新
```bash
git fetch upstream
git checkout custom-main
git merge upstream/main
```

如果出现冲突：
1. 优先保留官方 bugfix / 安全修复
2. 再恢复你的品牌和部署定制
3. 重点检查上面列出的高冲突文件

---

## 六、推荐部署流程

### 前端部署
```bash
cd frontend
npm run build
cd ../pages
npx wrangler deploy
```

### 后端部署
> 正式后端是 `cfmail-api`，部署前必须确认配置、D1 绑定、环境变量都正确。

---

## 七、冲突处理建议

同步官方更新时，优先按以下顺序判断：

1. **后端安全修复 / bugfix**：优先保留官方实现
2. **前端功能修复**：先接受官方，再把你的品牌/交互补回去
3. **部署方式相关**：保留你当前 `cfmail-frontend` 的 Worker + Assets 结构
4. **品牌类改动**：最后恢复 `CFMail`

---

## 八、重要提醒

- 不要直接把正式后端 `cfmail-api` 当测试环境反复覆盖
- 前端部署通常不会清除邮箱/邮件数据，但后端部署或数据库操作可能会影响数据
- 同步官方更新前，建议先备份当前分支：

```bash
git branch backup/custom-main-$(date +%Y%m%d)
```

---

## 九、建议后续可继续做的优化

- 将品牌名抽成统一常量，减少后续冲突
- 将“随机子域名 / 自定义子域名”区域拆成独立组件，降低页面冲突概率
- 保留一个测试前端 Worker（如 `cfmail-frontend-staging`）用于验证官方更新后再发布正式环境
