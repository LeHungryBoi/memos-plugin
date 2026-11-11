# Historical AI Log

## Custom UI 描述

- 以现有 UI code 为准。
- 一个 language card 有多个文本框，每个文本框对应一个语言代码（例如 en、jp、cn）；用户可选择每张卡片包含哪些类型。
- 一个 language card 里的文本框叫 language section。
- language card 的 note 编辑 UI 推荐显示 raw JSON，以便发现错误。

## 数据结构

- `"_t":"lc","v":2` 是 language card header，用来注明一个 note 是 language card type，不要改。
- 没有 header 也能识别，为了 backwards compatibility。
- 尽量依赖 Memos 本身的 API 来增加可靠性。
- 一个 language card 对应 Memos 本身的一个 note/card/item，以复用 Memos API。
- language card 的 custom 结构通过 JSON 直接写到一个 note 里面；即使插件不可用，普通 Memos 客户端也能看到 JSON。

```json
{
  "_t": "lc",
  "v": "2",
  "en": "serendipity",
  "cn": "意外发现珍宝的运气 / 缘分",
  "jp": "セレンディピティ"
}
```

Language section 是 optional，可以使用任意组合，未来也可以增加新语言。使用标准 ISO 语言代码可降低兼容问题：

```json
{
  "_t": "lc",
  "v": "2",
  "en": "motor",
  "cn": "电机"
}
```

## Space 标记（存放位置）

- 想让 language card 固定存进某个 space：往该 space 的 description 里放入仅含 header 的 JSON：`{"_t":"lc","v":2}`。
- 插件识别 space 列表 API 并读取各 space 的 description；只允许一个 space 带此 header（多个则警告、不自动选择），没找到则弹引导。
- 2026-10-18 实现：插件的 Space 指示器（弹窗标题栏）+ header 复制框（弹窗底部）。

## 卡片快捷操作（Quick Actions，2026-10-20 实现）

- 需求：memo 卡片右上角原生三点菜单里的 Pin / Edit / Archive 直接外露成图标，省掉一次点击。
- 实现：给每张 memo 卡片的原生 `data-slot="memo-header-actions"` 注入图标按钮（置于三点按钮左侧），点击时驱动该卡片原生的三点下拉菜单并点击对应菜单项，复用原生逻辑。
- 菜单 DOM 事实（2026-10-20 Chrome 实测，服务器 0.31.0）：触发器为 `button[aria-label="More"]`（`data-slot="dropdown-menu-trigger"`，Base UI 渲染，菜单挂在 body 下的 portal，`role="menu"` + `aria-labelledby` 指向触发器 id）；菜单项为 `div[role="menuitem"]`，顶层 Pin/Edit/Copy/Archive/More，子菜单 Copy→Copy Link/Copy Content，More→Move to Space/Delete；图标为 lucide（bookmark-plus/pen-line/archive/trash）。
- 所有菜单项的 `data-variant` 都是 `default`，没有 `destructive`；Delete 只存在于 `More` 子菜单里，所以外置删除按钮的 path 必须是 `['More','Delete']` 并按 label / `lucide-trash` 匹配。
- 原生编辑器打开时 `article` 整体被替换，且编辑器是 CodeMirror 不是 tiptap，插件不会误抓编辑器内容。
- 快捷集合可在 `CONFIG.quickActions` 增删，`path` 支持子菜单路径（如 `['Copy', 'Copy Content']`）；窄屏 <480px 自动隐藏图标保留三点菜单。

## API 版本状况（2026-10-18 核实）

### 版本规则与时间线

- Memos 在 2026-10 换了版本号规则：旧规则 `0.x` 改为按年月的 CalVer（`26.10` = 2026 年 10 月）。
- `v0.31.0`（2026-09-19）是旧规则最后一个正式版，也是用户服务器版本。
- `26.10-RC.1`（2026-10-09）是新规则首个候选版本；之后的正式版形如 `26.10.0` / `26.10.1`。`26.10.x` 比 `0.31.0` 新。

### 用户服务器和 API

- 用户服务器是 **Memos 0.31.0**，使用 v1 API：REST `/api/v1/...`、Connect `/memos.api.v1.*`。
- `memos-api-docs/` 和工作区 `/memos` 源码是 26.10.x 最新版，使用 REST `/api/...`、Connect `/memos.api.*`；它们不代表用户服务器。
- 0.31.0 已包含 SpaceService（`GET /api/v1/spaces`、`Memo.space`、`Space.description`）。
- 插件 API 请求做了双代兼容：先走最新版路径，遇 404/410 自动回退 v1 路径；0.31 上新版路径可能返回 404，不能只判断 410。
- 确认服务器版本：Memos 设置页，或 `GET <服务器>/api/v1/instance/profile` 的 `version` 字段。

### 下次确认 API 的优先级

服务器版本对应的 proto 是 API 契约事实源。0.31.0 契约在：
`https://github.com/usememos/memos/tree/v0.31.0/proto/api/v1`

常用 raw 文件：

- `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/space_service.proto`
- `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/memo_service.proto`
- `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/auth_service.proto`
- `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/user_service.proto`
- `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/instance_service.proto`

最新版对照可把 URL 中的 `v0.31.0` 换成 `main`（或检查工作区 `memos/proto/api/`）。注意 tag 命名随版本规则变化：旧规则带 `v` 前缀，新规则如 `26.10-RC.1` 不带。

### 已知字段差异

- tag 统计：0.31 = `ListAllUserStats`（`GET /api/v1/users:stats`，响应 `stats[].tagCount`）；最新版 = `ListUserStats`（parent `users/-`，`GET /api/users/-/stats`，响应 `userStats[].tagCounts`）。
- token 刷新：0.31 = `POST /api/v1/auth/refresh`；最新版 = `POST /api/auth/refresh`。

### 目录

`memos/` 保持最新版源码不动（它是“最新版参考”，不是服务器版本）；如确需 0.31 服务端源码，另拉 `git clone --branch v0.31.0 --depth 1`，不要覆盖现有文件夹。
