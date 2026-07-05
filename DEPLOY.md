# 部署到 Netlify 指南

## 快速部署（推荐）

### 方式1：通过 GitHub 部署

1. **准备代码**
   ```bash
   # 下载项目代码
   # 或从当前环境导出
   ```

2. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

3. **在 Netlify 部署**
   - 访问 [netlify.com](https://netlify.com)
   - 点击 "Add new site" → "Import an existing project"
   - 选择 GitHub，授权并选择仓库
   - 构建配置会自动检测 `netlify.toml`
   - 点击 "Deploy site"

4. **获取永久链接**
   - 部署完成后获得链接如：`https://your-site-name.netlify.app`
   - 可自定义域名

### 方式2：通过 Netlify CLI 部署

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录 Netlify**
   ```bash
   netlify login
   ```

3. **构建项目**
   ```bash
   pnpm install
   pnpm run build
   ```

4. **部署**
   ```bash
   netlify deploy --prod
   ```

## 配置说明

### netlify.toml 关键配置

```toml
[build]
  command = "pnpm run build"    # 构建命令
  publish = ".next"              # 发布目录

[build.environment]
  NODE_VERSION = "20"            # Node.js 版本
```

### 环境变量

如需添加环境变量（如API密钥）：
1. 进入 Netlify 站点设置
2. 找到 "Environment variables"
3. 添加变量名和值

## 自定义域名

1. 在 Netlify 站点设置中找到 "Domain settings"
2. 点击 "Add custom domain"
3. 输入你的域名
4. 按提示配置 DNS

## PWA 支持

项目已配置 PWA，部署后：
- 访问网站
- 点击浏览器"添加到主屏幕"
- 即可像原生 App 一样使用

## 数据持久化

- 数据存储在浏览器 localStorage
- 同一域名下数据持久保存
- 清除浏览器数据会丢失记录
- 建议定期导出备份

## 常见问题

### Q: 部署后页面空白？
A: 检查浏览器控制台错误，可能是环境变量未配置

### Q: 离线功能不工作？
A: Service Worker 需要 HTTPS，Netlify 默认提供 HTTPS

### Q: 如何更新部署？
A: 推送代码到 GitHub 会自动触发重新部署

## 免费额度

Netlify 免费计划包含：
- 每月 100GB 带宽
- 每月 300 分钟构建时间
- 1 个站点
- 自动 HTTPS
- 表单处理（每月 100 次）

对于个人使用完全足够！
