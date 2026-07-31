# 互动客厅

一个现代化的留言板应用，源自 PHP 项目重构，采用 React + TypeScript 前端，部署于腾讯 EdgeOne Serverless 平台。

## 项目介绍

「互动客厅」是一个互动留言社区。用户可发布留言、上传图片、查看他人留言；管理员可登录后台进行回复、删除等管理操作。

### 核心功能

- **留言发布**：支持文字 + 图片，可选表情、昵称
- **留言列表**：分页加载、关键词搜索、最新优先
- **管理员登录**：JWT 鉴权，密码 bcrypt 哈希存储
- **留言管理**：管理员可回复、删除留言
- **图片上传**：支持本地上传（腾讯云 COS）或远程图片 URL
- **修改密码**：登录后可在前台底部弹窗修改密码

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 状态管理 | Zustand |
| 路由 | React Router v7 |
| 后端（生产） | EdgeOne Cloud Functions（`cloud-functions` 目录，纯 JS） |
| 后端（本地开发） | Express + TypeScript（`api` 目录，端口 3001） |
| 数据库 | MongoDB Atlas |
| 文件存储 | 腾讯云 COS |
| 鉴权 | JWT + bcryptjs |
| 部署 | 腾讯 EdgeOne Pages |

### 项目结构

```
talk/
├── src/                    # 前端源码
│   ├── components/         # 组件（MessageForm、MessageList、Navbar 等）
│   ├── pages/              # 页面（Home、Login、Yiyan）
│   ├── lib/                # API 封装、工具函数
│   ├── store/              # Zustand 状态管理
│   └── hooks/              # 自定义 Hooks
├── cloud-functions/        # EdgeOne 生产环境 API（纯 JS）
│   ├── _lib.js             # 共享工具库（MongoDB 连接、JWT、JSON 响应）
│   ├── _cos.js             # 腾讯云 COS 工具库
│   └── api/                # 路由即文件
│       ├── auth/           # 登录、获取信息、修改密码
│       ├── messages/       # 留言 CRUD
│       ├── upload/         # 图片上传
│       ├── debug.js        # 数据库诊断
│       ├── health.js       # 健康检查
│       └── setup.js        # 初始化管理员
├── api/                    # 本地开发用 Express 后端
├── public/                 # 静态资源（图片、图标、表情）
├── edgeone.json            # EdgeOne 构建配置
└── package.json
```

## 使用说明

### 环境准备

- Node.js 18+
- MongoDB Atlas 账号（用于数据库）
- 腾讯云 COS（用于图片存储，可选）

### MongoDB Atlas 设置

本项目使用 MongoDB Atlas（云数据库），免费集群即可满足需求。设置步骤：

1. **注册账号并创建集群**
   - 访问 https://www.mongodb.com/cloud/atlas/register 注册
   - 选择「Free」免费方案，选择离用户最近的区域（如 AWS / Singapore）
   - 等待集群创建完成（约 3-5 分钟）

2. **创建数据库用户**
   - 左侧菜单 → Database Access → Add New Database User
   - 填写用户名（如 `talks`）和密码（需妥善保存）
   - Database User Privileges 选择「Read and write to any database」

3. **配置网络访问白名单**
   - 左侧菜单 → Network Access → Add IP Address
   - 开发阶段可选「Allow Access from Anywhere」（`0.0.0.0/0`）
   - 生产环境建议只添加 EdgeOne 出口 IP 和本地 IP

4. **获取连接字符串**
   - 左侧菜单 → Database → Connect → Drivers
   - 复制 Connection String，格式如下：
     ```
     mongodb+srv://<用户名>:<密码>@<集群地址>/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - **在连接字符串中追加数据库名 `/talks`**（关键！否则会连到默认的 test 库）：
     ```
     mongodb+srv://<用户名>:<密码>@<集群地址>/talks?retryWrites=true&w=majority&appName=Cluster0
     ```

5. **验证连接**
   - 将完整连接字符串填入 `.env.local` 的 `DATABASE_URL`
   - 启动项目后访问 `/api/debug`，若返回 `database.connected: true` 即连接成功

> **常见问题**：如果 `/api/debug` 显示连接失败，依次检查：① 密码是否正确 ② 是否已添加 IP 白名单 ③ 连接字符串是否包含 `/talks` ④ 用户权限是否为 read/write。

### 本地开发

1. **安装依赖**

```bash
npm install
```

2. **配置环境变量**

在项目根目录创建 `.env.local`：

```env
DATABASE_URL="mongodb+srv://<用户名>:<密码>@<集群地址>/talks?retryWrites=true&w=majority"
JWT_SECRET="你的JWT密钥"
```

> 注意：MongoDB 连接字符串必须包含数据库名 `/talks`，否则会默认连到错误的数据库。

3. **启动开发服务器**

```bash
npm run dev
```

该命令会同时启动：
- 前端 Vite 开发服务器（默认 http://localhost:5173）
- 后端 Express API 服务器（http://localhost:3001）

前端通过 Vite proxy 将 `/api` 请求转发到后端。

### 生产部署（EdgeOne）

1. **推送代码到 GitHub**

```bash
git push origin main
```

2. **EdgeOne 自动构建部署**

EdgeOne Pages 检测到推送后会自动构建。`cloud-functions` 目录下的文件会被识别为 Cloud Functions，`src` 目录通过 Vite 构建为静态资源。

3. **配置环境变量**

在 EdgeOne 控制台 → 项目设置 → 环境变量中配置：

| 变量名 | 说明 |
|--------|------|
| `DATABASE_URL` | MongoDB 连接字符串（含 `/talks` 数据库名） |
| `JWT_SECRET` | JWT 签名密钥（固定值，详见下方说明） |
| `COS_SECRET_ID` | 腾讯云 COS 密钥 ID（如需图片上传） |
| `COS_SECRET_KEY` | 腾讯云 COS 密钥 |
| `COS_BUCKET` | COS 存储桶名 |
| `COS_REGION` | COS 区域 |

> **关于 `JWT_SECRET`**：本项目的 JWT 密钥为固定字符串 `xinwenyi-talk-secret-key`，本地开发（`.env.local`）和 EdgeOne 生产环境都使用同一个值。该值用于对登录 token 进行签名，**必须固定**，否则每次变更会导致所有已登录用户被强制退出。
>
> **修改步骤**（如需增强安全性）：
> 1. 生成强随机字符串：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
> 2. 修改本地 `.env.local` 中的 `JWT_SECRET` 值
> 3. 登录 EdgeOne 控制台 → 项目设置 → 环境变量，更新 `JWT_SECRET` 为同一新值
> 4. 推送代码触发重新部署，或手动在控制台点击「重新部署」
> 5. 等待部署完成，所有用户需重新登录（旧 token 失效，密码不变）

4. **验证数据库连接**

部署完成后，浏览器访问：

```
https://你的域名/api/debug
```

正常返回如下 JSON 即表示数据库已连接成功：

```json
{
  "env": {
    "DATABASE_URL_set": true,
    "JWT_SECRET_set": true,
    "NODE_ENV": "not set"
  },
  "database": {
    "connected": true,
    "adminCount": 0,
    "messageCount": 0
  }
}
```

> 若 `database.connected` 为 `false` 或返回 500，请依次检查：① MongoDB 用户密码是否正确 ② Network Access 是否已添加 `0.0.0.0/0` ③ 连接字符串是否包含 `/talks` 数据库名。

5. **初始化管理员**

确认数据库连接成功后（`adminCount: 0` 表示尚未初始化），浏览器访问：

```
https://你的域名/api/setup
```

返回 `{"success":true,"message":"管理员初始化成功"}` 即完成初始化，默认账号：
- 用户名：`admin`
- 密码：`admin123`

> **安全提示**：初始化后请立即用此账号登录，到首页底部点击「修改密码」改成强密码。

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动前后端开发服务器 |
| `npm run client:dev` | 仅启动前端 |
| `npm run server:dev` | 仅启动后端（Express） |
| `npm run build` | 构建前端生产版本 |
| `npm run lint` | ESLint 代码检查 |
| `npm run check` | TypeScript 类型检查 |

## API 接口

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | `/api/health` | 健康检查 | 否 |
| GET | `/api/debug` | 数据库诊断 | 否 |
| GET/POST | `/api/setup` | 初始化管理员 | 否 |
| POST | `/api/auth/login` | 登录 | 否 |
| GET | `/api/auth/me` | 获取当前管理员 | 是 |
| PUT | `/api/auth/password` | 修改密码 | 是 |
| GET | `/api/messages` | 获取留言列表 | 否 |
| POST | `/api/messages` | 发布留言 | 否 |
| DELETE | `/api/messages/:id` | 删除留言 | 是 |
| PUT | `/api/messages/:id/reply` | 回复留言 | 是 |
| POST | `/api/upload` | 上传图片到 COS | 是 |
| POST | `/api/upload/remote` | 验证远程图片 URL | 否 |
| DELETE | `/api/upload/:filename` | 删除 COS 图片 | 是 |

## 注意事项

- **EdgeOne Cloud Functions 必须使用 `.js` 文件扩展名**（不支持 `.ts`）
- **目录名必须是 `cloud-functions`**（EdgeOne 2026 年 3 月后将 `node-functions` 重命名为 `cloud-functions`）
- **MongoDB 连接字符串必须包含数据库名 `/talks`**
- **Node.js 代码不能使用顶层 await**（EdgeOne 运行时基于 Node.js 14）
- **`externalNodeModules` 必须在 `edgeone.json` 中声明外部依赖**

## 许可证

MIT License · Copyright © 新文艺
