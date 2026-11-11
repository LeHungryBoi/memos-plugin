# Memos Language Card Extension

Memos Additional Script/Style 插件，为 memo 提供多语言卡片和卡片类型管理。

## 目录

- `src/`: 源码（只改这里）。
- `dist/`: 正式构建输出；`language-card.js` 已内联 CSS，`language-card.css` 用于双框安装或 Additional Style 上传。
- `.watch/`: watcher 的开发构建输出，不纳入 Git。
- `tools/`: API 部署、watcher 锁、数据契约与 mock DOM 测试。
- `schema/`: V2/V3 数据格式与需求说明。
- 历史 AI 日志和 API 兼容记录见 [AI-LOG.md](./AI-LOG.md)；仓库级 AI 参考在根目录 [AGENTS.md](../AGENTS.md)。

## 安装

1. 在 Memos Settings → System → Custom Code 中，将 `dist/language-card.js` 内容粘贴到 **Additional Script**。
2. 该 JS 已内联 CSS，通常不需要设置 Additional Style。
3. 如使用双框安装，将 `dist/language-card.css` 粘贴到 **Additional Style**。

## 构建、测试与部署

```powershell
npm install          # 仅首次安装 esbuild
npm run build        # 生成 dist/language-card.js 和 dist/language-card.css
npm run watch        # 监听 src/，构建到 .watch/ 并按 .env 配置自动上传
npm run deploy       # 手动上传 dist/ 中的两个文件
npm test             # 数据格式、部署逻辑、CSS 与 mock DOM 测试
```

VS Code 打开仓库时，`.vscode/tasks.json` 会启动 watcher。首次启动会在仓库根目录创建被 Git 忽略的 `.env` 模板：

```dotenv
MEMOS_INSTANCE_URL=https://your-memos.example.com
MEMOS_ADMIN_TOKEN=replace-with-admin-bearer-token
```

将占位值换成自己的实例地址和管理员 Bearer token。watcher 每次成功构建后会上传 `.watch/` 中的 JavaScript 和 CSS。上传脚本只针对 Memos 0.31.0 的 `PATCH /api/v1/instance/settings/GENERAL`：先读取完整 GENERAL 设置，仅替换 `additionalScript` / `additionalStyle`，原样保留其余设置，再 GET 回来核验保存结果。不要提交或分享 `.env`。

正式构建输出 `dist/`；watcher 输出 `.watch/`，避免开发过程覆盖正式产物。两个文件都是生成物，不要直接编辑；改 `src/` 后重新构建。

## CSS 模块

`src/styles/index.css` 按固定顺序登记 CSS 模块，构建时拼接后同时内联进 JS 并输出独立 CSS。新增模块需要在入口登记；`npm test` 会检查模块清单及生成物是否同步。

## 数据格式与架构

V3 卡片定义（分区、排序、别名）保存在 Space description marker 中；memo content 保存分区值、显示状态、说明和 tags。V2 兼容格式仍可读取和迁移。详情见 `schema/v2.md`、`schema/v3.md` 和 `schema/v3-requirements.md`。
