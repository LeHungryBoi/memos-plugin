# Language Card V3 需求规格（开发指导稿）

> **状态**：**已按本文的默认决策实现**（2026-11-08）。实际数据格式定稿见 `schema/v3.md`；V2 仍是读取器必须兼容的历史格式，见 `schema/v2.md`。
> **用途**：把用户提出的 5 项需求转成可实现、可验收的开发说明。下面 R1–R5 与原始需求一一对应、顺序不变、意图不合并。
> **术语**：卡片类型（type，绑定在一个 Space 上）／语言分区（section）／说明区（explanation）／空间标识（space marker，写在 `space.description` 里的 JSON）／管理入口。
> **优先级**：数据不丢 > 兼容 V2 > 单文件交付 > UI 细节。

---

## 0. 全局约束（R1–R5 共同遵守）

1. **交付形态不变**：源码在 `src/`，`npm run build` 用 esbuild 合并成**单个** `language-card.js`（内联 CSS）；生成物不可手改；`npm test`（V2 契约向量 + mock DOM 冒烟测试）必须通过，V3 改动要补新向量。
2. **运行环境不变**：纯浏览器 JS，无后端、无构建时数据、无油猴热重载；只用 Memos 当前会话 token；所有请求继续「先 `/api/...`，404/410 回退 `/api/v1/...`」的双代策略。
3. **单一真源**：卡片类型、类型排序、语言分区定义、说明区模式**只存在于 space marker**；每条 note 的 `content` 只存值。
4. **兼容底线**：读取器必须继续认识 V2 与更早的无 `_t` 卡片；**不能假设历史 memo 会被批量改写**（V2 §8.11）。迁移必须用户显式触发、有预览、可跳过，未知字段不得静默丢弃。
5. **版本分派**：V2 读取器按 `_t` 分派、**完全不看 `v`**（V2 §8.1）。V3 必须先定识别策略：若仍写 `_t:"lc"` 且只把 `v` 改成 3，旧版插件会把新卡片当 V2 渲染。
6. **移除全局分区权威**：`CONFIG.languages` 目前既决定 UI 又决定 JSON 键序，且 `card-model.js` 硬编码白名单 `en/ja/jp/zh/cn`（V2 §8.2）。V3 必须由类型定义动态生成 sections；`memos_lc_enabled_langs_v2`、`memos_lc_target_space_v2` 需决定复用、只读兼容还是废弃。
7. **多空间识别是硬难点**：`getCurrentSpace()` 现在只读 URL `/s/<id>`，而 feed 可能混合多个 Space 的 memo。V3 渲染必须能**按单条 memo 找到它所属的 Space 及类型定义**，否则不同卡片会串用分区。实现前需确认 Memos DOM 是否暴露每条 memo 的 space（可用 `data-memo-name` → 详情查询 → 缓存兜底）。
8. **原生行为不重写**：快捷按钮继续通过 `triggerNativeAction` 驱动 Memos 自己的菜单；样式继续主题自适应，超窄屏（< 480px）隐藏快捷图标的规则保持。

---

## R1 · 复制内容按钮

**原始意图**：在「置顶／编辑／归档」旁补上「复制内容」；这些按钮本来就是把三点子菜单里的项在外面再放一份，当时漏了 Copy Content。

**现状**：`src/config.js` 的 `CONFIG.quickActions` 只有 Pin / Edit / Archive；README 明确写着 `Copy（Copy Link / Copy Content）` 仍在三菜单内。`src/quick-actions.js` 已支持 `path` 多级子菜单（README 示例 `['Copy', 'Copy Content']`）、`findMenuItem` 的「精确 label → 包含 → lucide iconName」三级兜底、找不到时安静关菜单、以及 `data-lc-quick-actions` 幂等注入。

**实现要点**：
- 在 `CONFIG.quickActions` 追加一项（建议放在 Archive 之后）：`label: 'Copy Content'`、`path: ['Copy', 'Copy Content']`、`iconName: 'lucide-copy'`、`icon`: 复用与现有三项同写法的 lucide-copy SVG。
- **不改** `src/quick-actions.js` 的执行逻辑；按钮仍插在三点菜单左侧，样式仍克隆原生 More 按钮。
- README「Copy 仍在三菜单内」改为「Copy Content 已外置；Copy Link / Move to Space / Delete 等仍留在菜单内」。

**约束**：不自己实现剪贴板或 API；菜单标签本地化／Memos 改版时靠 `iconName` 兜底，结构不匹配时安静关闭菜单、不留残留；不得破坏 Pin/Edit/Archive；CSS 不新增独立样式类。

**验收**：卡片头出现 4 个快捷图标；点击 Copy Content 得到的剪贴板内容 = 该 memo 的原始 `content`；其余三项行为不变；菜单找不到时无异常；`npm test` 通过。

---

## R2 · 卡片类型与空间

**原始意图**：支持多个独立空间，**每个空间对应一种卡片类型**；类型及其信息（排序、语言分区定义）统一存进空间标识。示例：新增「New Speak」类型，分区是 English 与 New Speak；自定义方言 SKlang 中 `personal` 对应 `in room`（因 `in house` = Proprietary）。

**现状**：只允许**一个**专属 Space（`{"_t":"lc","v":2}`，多个带 header 会警告且不选目标）；分区来自全局 `CONFIG.languages`（JA/EN/ZH）；没有「卡片类型」概念；note 自带 `_t/v` 类型标记。

**目标与模型建议（非定稿，实现时写入 `schema/v3.md`）**：每个 Space 的 `description` 内嵌一个 marker，承载该类型的全部定义：

```json
{
  "_t": "lc", "v": 3,
  "typeId": "new-speak", "name": "New Speak", "order": 20,
  "explanationMode": "per-section",
  "sections": [
    { "key": "en", "label": "English", "code": "EN", "color": "#38bdf8" },
    { "key": "newSpeak", "label": "New Speak", "code": "NS", "color": "#34d399" }
  ],
  "sectionAliases": { "personal": "in room" }
}
```

- `sections` 的**数组顺序即 UI/序列化顺序**（取代 `CONFIG.languages` 的顺序语义）；`key` 是 note content 里的键，允许任意自定义字符串，不限 ISO 语言码。
- `order` 决定所有类型在管理入口里的排序；`typeId/name` 用于显示与匹配；`explanationMode` 见 R3；`sectionAliases` 显式声明分区名称映射。
- **示例解读**：「New Speak」类型的 sections 就是 `English` + `New Speak`，不复用 JA/EN/ZH；SKlang 中 `personal → in room`、而 `in house` 已被 `Proprietary` 占用，说明分区名是**类型内自定义标签**，不能靠全局同义词典推断，映射必须由该类型的 marker 显式声明。

**实现要点**：
- 建议新增 `src/card-types.js`：解析／校验 marker、缓存「space → type」、按 `order` 排序、提供 sections 列表。
- `src/spaces.js` 从「找唯一目标」改为「列出所有带 marker 的 Space + 按 memo 所属 Space 取定义」；`src/card-model.js` 用动态 sections 替换硬编码白名单与正则兜底键表；`src/card-render.js` / `src/editor.js` 由定义生成列与输入框。
- `CONFIG.languages` 最多降级为「新建类型时的默认模板」，不再是运行时权威。

**约束**：
- 一个 Space 最多一个类型 marker；marker 前后可有人类文字（沿用 V2「第一个 `{` → 最后一个 `}`」策略，但 JSON 必须严格可解析，V3 不继承正则兜底的坏 JSON 容忍）。
- 旧 marker `{"_t":"lc","v":2}` 视为**默认类型**而不是错误；`v` 必须参与分派。
- note content 只存 section 值、explanation、tags 与必要版本标识，**不存** sections / order / label / mode（R5.3）。
- 跨 Space feed 必须按 memo 取定义（全局约束 7）；找不到定义时走 V2 兼容路径并提示，不静默套默认类型。

**验收**：两个 Space 分别定义不同 sections，各自卡片按各自定义渲染；改 `order` 后管理列表顺序变化；新增 section 后新卡片多一列且旧卡片值不丢；note content 长度不随类型定义增长。

---

## R3 · 说明区（Explanation）

**原始意图**：各语言分区**独立**说明区之外，还提供一个**全局统一**说明区；统一说明显示在各语言说明下方；说明区总开关位于说明区上方，语言分区开关也控制对应的语言说明。

**现状**：无说明区；编辑器只有 `lc-editor-grid`（语言列）→ Tags → Preview；语言分区开关集中在 modal header 的 `.lc-modal-lang-bar`（"This note:" + 每人一个 chip）。

**目标**：
| 模式 | 数据 | 位置 |
| --- | --- | --- |
| 各语言说明 | 每个 section 一个 explanation 值 | 对应语言列**下方**各一块 |
| `unified` | 整张卡片一个共享 explanation 值 | 所有语言说明**下方**一块 |

- 新 note 同时支持语言说明和统一说明；旧类型 marker 的 `explanationMode: "global"` 与 `_e` 字符串继续读取为统一说明。
- 编辑器布局：语言列 → 对应语言说明 → 统一说明（第三行）→ Tags → Preview；feed 渲染同理。
- 语言 chip 同时控制对应语言列和说明，启用状态随 note 的 `_s` 保存；说明总开关独立写入 `_x`，关闭说明不影响语言列，反之亦然。

**约束**：切换模式时已有 explanation 值必须保留或明确映射，不得静默丢弃；V2 卡片无 explanation 时不渲染空说明区；CSS 继续主题自适应与移动端并排规则。

**待确认**：「开关」语义暂按**显示/隐藏说明区**处理，模式由类型定义决定；若需要「本卡片级模式切换」，则模式要作为 note 内一个字段，并同步改 R5.3 的 content 边界。

**验收**：语言开关同步切换其对应的语言说明并将启用键写入 `_s`；统一说明显示在语言说明下方并写入 `_u`；总开关通过 `_x` 控制说明显示；旧版全局说明及 V2 卡片正常读取；编辑已有卡片不丢值。

**涉及文件**：`src/card-model.js`（解析/序列化）、`src/editor.js`（输入、开关、preview）、`src/card-render.js`（渲染）、`src/card-types.js`（模式定义）、`src/styles/language-card.css`。

---

## R4 · 空间 / 卡片类型管理入口

**原始意图**：把当前**绿色显示元素**改成空间／卡片类型的管理入口：查看所有类型、调整排序、查看并管理各类型的语言分区定义（增删、排序）。兼容手动建立、无 marker 的 Space，以及可能不兼容的 note JSON；检测到不兼容格式时给提示并辅助迁移。因各语言空间的 language section 与 explanation section 框架一致，迁移**仅需映射语言分区名称**。

**现状**：绿色元素 = `lc-space-indicator` 的 `lc-si-ok` 状态（🃏 目标 Space），点击打开 `showSpaceInfoPopup`，只显示单个 Space 详情／多 marker 警告／无 marker 引导；`resolveTargetSpace` 只允许一个结果；插件**从不写** `space.description`。

**目标功能清单**：
1. 列出所有 Space：V3 marker / V2 marker / **无 marker（手动建立）**，显示名称、uid、类型名、order、section 列表。
2. 调整排序：上下移动或改 `order`，写回对应 Space 的 marker。
3. 类型定义管理：section 的增删、改名、排序，label/code/color，`explanationMode`，`sectionAliases`。
4. 无 marker Space：可「声明为卡片类型」（选默认定义并写 marker），也可复制 marker 文本供手动粘贴。
5. 不兼容 note 检测：扫描 Space 内 memo 的 `content`，分类为「V3 合规 / V2 或 legacy / 键名不匹配当前类型定义 / 非卡片 JSON」，逐条提示。
6. 辅助迁移：提供「旧分区名 → 新分区名」映射 UI → 预览结果 → 用户确认 → 逐条 PATCH。**因为 language section 与 explanation section 的框架一致，迁移只做键名映射，不改结构**（R3 的 explanation 值同样按对应 section 名映射）。

**写 Space 的约束**：`UpdateSpace = PATCH /api/spaces/{space}?updateMask=description`，`updateMask` 支持 `title, description, icon`，**仅 Space 管理员可用**（见 `memos-api-docs/memos-api/spaceservice.md`）。需按双代 API 回退扩展 `src/api.js`；401/403 时明确提示权限不足，并降级为「复制 marker 文本、引导手动粘贴到 Space 描述」，绝不静默失败。

**迁移约束**：读取器兼容优先（不能假设全部转换）；显式触发、有预览、可跳过、一次只处理一个 Space；未知键保留或明确提示，不静默丢弃；PATCH 沿用 `updateMask=content` 与现有「完整失败请求信息」错误展示；成功后不整页刷新，原地重绘。

**验收**：多个带 marker 的 Space 全部列出且可排序；无 marker Space 可识别并声明；不兼容 note 被列出并给出映射建议；确认后 content 按映射更新且原值不丢；非管理员得到清晰提示；V2 卡片仍可渲染。

**涉及文件**：`src/spaces.js`（marker 解析、入口、面板）、`src/api.js`（ListSpaces / UpdateSpace / ListMemos 双代）、`src/editor.js`（modal header 绑定）、`src/utils.js`（copy/escape）；建议新增 `src/space-manager.js`、`src/migration.js` 与对应 CSS。

---

## R5 · Bug 修复

### R5.1 移除首页「新建卡片」左侧无效的语言分区开关

- **现状**：`injectCreatorUI()` 生成 `.lc-lang-toggles` + `lc-toggle-btn-<key>` 并绑定 `toggleGlobalLang()`；`updateFloatingBar()` 负责刷新；`state.js` 的全局开关还影响 `card-render.js` 无内容卡片的回退、以及 `openModal()` 的默认 `initialLangs`；持久化键 `memos_lc_enabled_langs_v2`。
- **原因**：分区由语言卡片编辑器／类型定义决定，多卡片类型下「全局语言开关」语义不清且无效。
- **目标**：FAB 左侧只留 `New Card`；删除开关 DOM、事件绑定与 `updateFloatingBar` 调用链。
- **约束**：V2 无内容老卡片仍需一个确定性回退（建议「按类型定义显示空列」，或把旧 localStorage 当只读兼容）；不留死按钮；`toggleGlobalLang` 无引用后删除，并清理 `state.js` ↔ `editor.js` / `card-render.js` 的循环依赖；CSS `.lc-lang-toggles` / `.lc-lang-btn` 一并清理。
- **验收**：首页无语言 chip；FAB 正常打开编辑器；不再向该 localStorage 键写入；V2 无内容卡片仍渲染且不报错。

### R5.2 语言卡片编辑器不再重复显示头部

- **现状**：feed 卡片有 `lc-card-note-bar`（`🔤 Card` + ✏️），弹窗有 `lc-modal-header`（`🔤 New/Edit Language Card` + Space 指示器 + 分区开关 + 关闭）；编辑卡片时背景卡片与弹窗同时可见，`🔤 + 标题` 出现两次。
- **目标**：同一份「卡片类型／标题」信息在同一时刻只出现一次，编辑器不再重复渲染头部。
- **默认实现决策（待 UI 走查确认）**：保留 `lc-modal-header` 作为唯一头部（标题 + 当前类型 + 管理入口 + 关闭）；feed 的 `lc-card-note-bar` 去掉 `🔤 Card` 文案，仅保留编辑图标（或编辑态隐藏该标题）。若实际指的是弹窗 body 内另有一份 header，则删 body 内那份、保留 modal header。
- **约束**：不破坏编辑按钮入口、Esc／关闭、Space 指示器点击；移动端布局不因删头部错位。
- **验收**：打开编辑器时视觉上只有一个卡片头部；标题／类型／管理入口／关闭功能齐全；feed 编辑按钮可用。

### R5.3 卡片定义由空间提供，不重复存进每条笔记

- **现状**：`buildCardPayload()` 写 `{_t, v, ...语言值}`；解析依赖全局 `CONFIG`；类型／分区概念混在全局配置里。
- **目标**：space marker 是定义唯一真源；note `content` 只含值、explanation、tags 与必要版本标识，**不得出现** sections / order / labels / mode 等定义字段，避免笔记过长。
- **约束**：读 note 前先取所属 Space 定义（全局约束 7）；找不到定义走 V2 兼容并提示；保存/编辑不序列化定义；PATCH 仍只改 `content`；`schema/v2.md` 的 V2 规则必须继续可解析。
- **验收**：同一类型下 100 条 note，每条 content 不随定义变长；改 Space 定义后已有 note 按新定义渲染（键名变更走 R4 映射）；V2 note 不受影响。

---

## 依赖与实施顺序（建议）

1. **R2 数据模型 + 类型定义读取**（R3/R4/R5 全依赖它）
2. **R4 管理入口**（写 Space marker、不兼容检测、迁移）
3. **R5.3 note 瘦身**（与 R2 同一数据层）
4. **R3 说明区**（依赖动态 sections）
5. **R5.1 / R5.2 UI 清理**；**R1** 与上述解耦，可随时先做
6. 每一步补 `tools/*.test.mjs` 向量并接入 `npm test`；实现时另写 `schema/v3.md` 定稿数据格式，本文保持为需求基线

## 完成定义（DoD）

- 五个 R 条目各自的验收项全部通过；`npm run build` 仍产出单个 `language-card.js`，`npm test` 通过。
- V2 契约向量 21/21 仍然通过；V2 与无 `_t` 老卡片在混合 feed 里可渲染。
- 没有任何卡片类型定义被写进 note content；没有任何迁移在未经用户确认时改写 memo。
- 权限不足／marker 缺失／JSON 不兼容／菜单结构变化四类异常都有明确提示，无静默失败。

## 实现时采用的默认决策

用户未逐条确认，实现按本文各处的默认解释落地（详见 `schema/v3.md` §1）：

1. R5.2：保留 modal header 为唯一头部，feed 卡片去掉 `🔤 Card` 文案，只留编辑按钮。
2. R3：开关 = 显示/隐藏说明区（`_x`）；模式由类型定义 `explanationMode` 决定。
3. SKlang：alias 定义为「旧 note 键 → 新 note 键」，同时用于渲染兜底与迁移；`in house` 与 `personal` 不做隐式同义推断。
4. 写 `space.description`：尝试管理员 PATCH，401/403 时降级为复制 marker 手动粘贴。
5. 混合 feed：启动时用 `ListMemos(parent=space)` 建立 `memoName → spaceName` 缓存，失败回退当前 URL Space。
6. V3 识别键：沿用 `_t:"lc"` + `v:3`，V3 读取器按 `v` 分派，V2 卡片继续走旧路径。
