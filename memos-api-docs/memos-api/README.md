# Memos API — 本地完整参考（官方文档镜像）

- **来源**：https://usememos.com/docs/api/latest（官方文档站全量抓取，Next.js SSR 页面）
- **抓取时间**：2026-10-17T03:04:16.727Z
- **覆盖**：93 个页面 = 8 个 service 的 92 个方法 + 总览，0 失败
- **目标实例**：http://cuteboi:5230（Memos 0.31.0）
- **实例 API 基址**：`/api/v1`（文档示例路径以 `/api` 开头，实例上等价加 `/v1`；web-clipper 也会自动探测两者）
- **认证**：`Authorization: Bearer <PAT>`

## 端点总表（92 个）

| # | Service | RPC | HTTP | Path | 说明 |
|---|---------|-----|------|------|------|
| 1 | AI Service | Transcribe | POST | `/api/ai:transcribe` | Transcribe transcribes an audio file with the instance's configured transcription provider. The caller must be |
| 2 | Attachment Service | BatchDeleteAttachments | POST | `/api/attachments:batchDelete` | BatchDeleteAttachments deletes up to 100 attachments in one atomic request. The caller must be the uploader of |
| 3 | Attachment Service | CreateAttachment | POST | `/api/attachments` | CreateAttachment creates an attachment from inline content. |
| 4 | Attachment Service | DeleteAttachment | DELETE | `/api/attachments/{attachment}` | DeleteAttachment deletes an attachment uploaded by the caller. |
| 5 | Attachment Service | GetAttachment | GET | `/api/attachments/{attachment}` | GetAttachment gets an attachment by name. An unlinked attachment is visible only to its uploader and admins; a |
| 6 | Attachment Service | ListAttachments | GET | `/api/attachments` | ListAttachments lists attachments linked to memos the caller can read, plus the caller's unlinked uploads. |
| 7 | Attachment Service | UpdateAttachment | PATCH | `/api/attachments/{attachment}` | UpdateAttachment updates an attachment. Only `filename` can be updated. The caller must be the uploader or an  |
| 8 | Attachment Service | UploadAttachment | POST | `/api/attachments:upload` | UploadAttachment uploads a file in bounded chunks. The first call carries the spec and returns an upload_id; l |
| 9 | Auth Service | GetCurrentUser | GET | `/api/auth/me` | GetCurrentUser returns the authenticated user, similar to OIDC's /userinfo endpoint. When the caller is not si |
| 10 | Auth Service | RefreshToken | POST | `/api/auth/refresh` | RefreshToken exchanges the refresh token for a new access token. The refresh token is read from the HttpOnly c |
| 11 | Auth Service | SignIn | POST | `/api/auth/signin` | SignIn authenticates a user with password or SSO credentials. On success, returns a short-lived access token a |
| 12 | Auth Service | SignOut | POST | `/api/auth/signout` | SignOut ends the current session. Revokes the refresh token from the cookie and clears the cookie. |
| 13 | Identity Provider Service | CreateIdentityProvider | POST | `/api/identity-providers` | CreateIdentityProvider creates an identity provider. Requires the admin role. Fails with FAILED_PRECONDITION w |
| 14 | Identity Provider Service | DeleteIdentityProvider | DELETE | `/api/identity-providers/{identity-provider}` | DeleteIdentityProvider deletes an identity provider. Requires the admin role. Providers configured by the depl |
| 15 | Identity Provider Service | GetIdentityProvider | GET | `/api/identity-providers/{identity-provider}` | GetIdentityProvider gets an identity provider. The client secret is never returned. |
| 16 | Identity Provider Service | ListIdentityProviders | GET | `/api/identity-providers` | ListIdentityProviders lists identity providers. Public, so the sign-in page can show SSO options. Client secre |
| 17 | Identity Provider Service | UpdateIdentityProvider | PATCH | `/api/identity-providers/{identity-provider}` | UpdateIdentityProvider updates an identity provider. Requires the admin role. Providers configured by the depl |
| 18 | Instance Service | BatchGetInstanceSettings | POST | `/api/instance/settings:batchGet` | BatchGetInstanceSettings gets up to 100 instance settings in request order, with the same access rules as GetI |
| 19 | Instance Service | GetInstanceProfile | GET | `/api/instance/profile` | GetInstanceProfile gets the instance profile. Available without authentication, including on a private instanc |
| 20 | Instance Service | GetInstanceSetting | GET | `/api/instance/{instance}/*` | GetInstanceSetting gets an instance setting. Available without authentication, except STORAGE and NOTIFICATION |
| 21 | Instance Service | GetInstanceStats | GET | `/api/instance/stats` | GetInstanceStats gets resource usage statistics for the instance. Admin only. Results are cached for 60 second |
| 22 | Instance Service | TestInstanceEmailSetting | POST | `/api/instance/settings/notification:testEmail` | TestInstanceEmailSetting sends a test email with the provided or stored SMTP settings. Admin only. |
| 23 | Instance Service | UpdateInstanceSetting | PATCH | `/api/instance/{instance}/*` | UpdateInstanceSetting replaces an instance setting. Admin only. Settings configured by the deployment cannot b |
| 24 | Memo Service | BatchGetLinkMetadata | POST | `/api/memos/-/linkMetadata:batchGet` | BatchGetLinkMetadata fetches the metadata of up to 10 links. |
| 25 | Memo Service | CreateMemo | POST | `/api/memos` | CreateMemo creates a memo owned by the authenticated user. The request body is a Memo; set its Markdown conten |
| 26 | Memo Service | CreateMemoComment | POST | `/api/memos/{memo}/comments` | CreateMemoComment atomically creates an independent memo plus one immutable COMMENT context relation to the na |
| 27 | Memo Service | CreateMemoShare | POST | `/api/memos/{memo}/shares` | CreateMemoShare creates a share link for a memo. Requires the memo creator or an instance administrator. Only  |
| 28 | Memo Service | DeleteMemo | DELETE | `/api/memos/{memo}` | DeleteMemo deletes the named memo and its comment subtree, including nested replies and their owned resources. |
| 29 | Memo Service | DeleteMemoReaction | DELETE | `/api/memos/{memo}/reactions/{reaction}` | DeleteMemoReaction deletes a reaction. Requires the reaction creator or an instance administrator. |
| 30 | Memo Service | DeleteMemoShare | DELETE | `/api/memos/{memo}/shares/{share}` | DeleteMemoShare revokes a share link. Requires the memo creator or an instance administrator. |
| 31 | Memo Service | GetLinkMetadata | GET | `/api/memos/-/linkMetadata` | GetLinkMetadata fetches the title, description, and image of a link. |
| 32 | Memo Service | GetMemo | GET | `/api/memos/{memo}` | GetMemo gets a memo. Requires read access to the memo. |
| 33 | Memo Service | GetSharedMemo | GET | `/api/shares/{shareToken}/memo` | GetSharedMemo resolves a share token to its memo. No authentication is required. Returns NOT_FOUND if the toke |
| 34 | Memo Service | ListMemoAttachments | GET | `/api/memos/{memo}/attachments` | ListMemoAttachments lists the attachments of a memo. Requires read access to the memo. |
| 35 | Memo Service | ListMemoComments | GET | `/api/memos/{memo}/comments` | ListMemoComments lists the active comments on a memo that the caller can read. Requires read access to the mem |
| 36 | Memo Service | ListMemoReactions | GET | `/api/memos/{memo}/reactions` | ListMemoReactions lists the reactions on a memo. Requires read access to the memo. |
| 37 | Memo Service | ListMemoRelations | GET | `/api/memos/{memo}/relations` | ListMemoRelations lists the relations of a memo in both directions. Requires read access to the memo. |
| 38 | Memo Service | ListMemos | GET | `/api/memos` | ListMemos lists the memos the caller can read, excluding comments. Anonymous callers can list only when the in |
| 39 | Memo Service | ListMemoShares | GET | `/api/memos/{memo}/shares` | ListMemoShares lists all share links for a memo. Requires the memo creator or an instance administrator. |
| 40 | Memo Service | SetMemoAttachments | PATCH | `/api/memos/{memo}/attachments` | SetMemoAttachments replaces the full set of attachments on a memo with the provided list (not an append). Pass |
| 41 | Memo Service | SetMemoRelations | PATCH | `/api/memos/{memo}/relations` | SetMemoRelations replaces the full set of mutable REFERENCE relations on a memo. COMMENT relations are immutab |
| 42 | Memo Service | UpdateMemo | PATCH | `/api/memos/{memo}` | UpdateMemo updates the memo fields listed in update_mask. Requires the memo creator or an instance administrat |
| 43 | Memo Service | UpsertMemoReaction | POST | `/api/memos/{memo}/reactions` | UpsertMemoReaction adds or updates the authenticated user's reaction on a memo. Requires read access to the me |
| 44 | Space Service | AcceptSpaceInvitation | POST | `/api/spaces/{space}/invitations/{invitation}:accept` | AcceptSpaceInvitation accepts a pending invitation and creates a membership with the invited role. Only the in |
| 45 | Space Service | CreateSpace | POST | `/api/spaces` | CreateSpace creates a space and makes the authenticated caller its first administrator. |
| 46 | Space Service | CreateSpaceInvitation | POST | `/api/spaces/{space}/invitations` | CreateSpaceInvitation invites an existing active user to a space. Only a space administrator can invite. The i |
| 47 | Space Service | DeclineSpaceInvitation | POST | `/api/spaces/{space}/invitations/{invitation}:decline` | DeclineSpaceInvitation declines a pending invitation without creating a membership. Only the invitee can decli |
| 48 | Space Service | DeleteSpace | DELETE | `/api/spaces/{space}` | DeleteSpace permanently deletes a space and every memo currently placed in it. It never follows memo relations |
| 49 | Space Service | DeleteSpaceInvitation | DELETE | `/api/spaces/{space}/invitations/{invitation}` | DeleteSpaceInvitation revokes a pending invitation. Only a space administrator can revoke it. |
| 50 | Space Service | DeleteSpaceMember | DELETE | `/api/spaces/{space}/members/{member}` | DeleteSpaceMember removes a member. A space administrator can remove any member, and a member may delete their |
| 51 | Space Service | GetSpace | GET | `/api/spaces/{space}` | GetSpace gets a space of which the authenticated caller is a member. Spaces the caller is not a member of are  |
| 52 | Space Service | GetSpaceInvitation | GET | `/api/spaces/{space}/invitations/{invitation}` | GetSpaceInvitation gets one pending invitation. Only the invitee or a space administrator can get it. |
| 53 | Space Service | GetSpaceMember | GET | `/api/spaces/{space}/members/{member}` | GetSpaceMember gets one membership in a space. The caller must be a member of the space. |
| 54 | Space Service | ListSpaceInvitations | GET | `/api/spaces/{space}/invitations` | ListSpaceInvitations lists the pending invitations for a space. Only a space administrator can list them. |
| 55 | Space Service | ListSpaceMembers | GET | `/api/spaces/{space}/members` | ListSpaceMembers lists the members of a space. The caller must be a member of the space. |
| 56 | Space Service | ListSpaces | GET | `/api/spaces` | ListSpaces lists the spaces of which the authenticated caller is a member. |
| 57 | Space Service | ListUserSpaceInvitations | GET | `/api/users/{user}/spaceInvitations` | ListUserSpaceInvitations lists the authenticated user's pending space invitations. A user cannot list another  |
| 58 | Space Service | UpdateSpace | PATCH | `/api/spaces/{space}` | UpdateSpace updates space metadata. Only a space administrator can update a space. |
| 59 | Space Service | UpdateSpaceMember | PATCH | `/api/spaces/{space}/members/{member}` | UpdateSpaceMember changes a member's space role. Only a space administrator can change roles, and a space must |
| 60 | User Service | BatchGetUsers | POST | `/api/users:batchGet` | BatchGetUsers gets active users by username. Usernames that match no active user are omitted from the response |
| 61 | User Service | CreateLinkedIdentity | POST | `/api/users/{user}/linkedIdentities` | CreateLinkedIdentity completes an OAuth flow and links the resulting SSO identity to the authenticated user, w |
| 62 | User Service | CreateMemoView | POST | `/api/users/{user}/views` | CreateMemoView creates a View for a user. Only the user may call it. |
| 63 | User Service | CreatePersonalAccessToken | POST | `/api/users/{user}/personalAccessTokens` | CreatePersonalAccessToken creates a personal access token for a user. Only the user may call it. The token val |
| 64 | User Service | CreateUser | POST | `/api/users` | CreateUser creates a user. The first user of an instance becomes an admin. Otherwise, unless an admin calls it |
| 65 | User Service | CreateUserWebhook | POST | `/api/users/{user}/webhooks` | CreateUserWebhook creates a webhook for a user. Only the user may call it. The service generates a signing sec |
| 66 | User Service | DeleteLinkedIdentity | DELETE | `/api/users/{user}/linkedIdentities/{linkedIdentity}` | DeleteLinkedIdentity unlinks an SSO identity from a user. The user and admins may call it. |
| 67 | User Service | DeleteMemoView | DELETE | `/api/users/{user}/views/{view}` | DeleteMemoView deletes a View. Only the owner may call it. |
| 68 | User Service | DeletePersonalAccessToken | DELETE | `/api/users/{user}/personalAccessTokens/{personalAccessToken}` | DeletePersonalAccessToken deletes a personal access token, which stops working immediately. Only the owner may |
| 69 | User Service | DeleteUser | DELETE | `/api/users/{user}` | DeleteUser deletes a user. Users may delete themselves; admins may delete anyone. A user who belongs to any sp |
| 70 | User Service | DeleteUserNotification | DELETE | `/api/users/{user}/notifications/{notification}` | DeleteUserNotification permanently deletes a notification. Only the receiver may call it. |
| 71 | User Service | DeleteUserWebhook | DELETE | `/api/users/{user}/webhooks/{webhook}` | DeleteUserWebhook deletes a webhook. Only the owner may call it. |
| 72 | User Service | ExportMemos | GET | `/api/users/{user}:exportMemos` | ExportMemos writes every memo the user created, with comments, archived memos, and attachment files, as a Memo |
| 73 | User Service | GetLinkedIdentity | GET | `/api/users/{user}/linkedIdentities/{linkedIdentity}` | GetLinkedIdentity gets an SSO identity linked to a user. The user and admins may call it. |
| 74 | User Service | GetMemoView | GET | `/api/users/{user}/views/{view}` | GetMemoView gets a View. Only the owner may call it. |
| 75 | User Service | GetUser | GET | `/api/users/{user}` | GetUser gets a user by resource name. |
| 76 | User Service | GetUserSetting | GET | `/api/users/{user}/settings/{setting}` | GetUserSetting gets a user setting. Only the user may call it. |
| 77 | User Service | GetUserStats | GET | `/api/users/{user}:getStats` | GetUserStats returns memo statistics for one user, counting the user's memos that the caller can read. |
| 78 | User Service | GetUserWebhookSigningSecret | GET | `/api/users/{user}/webhooks/{webhook}:getSigningSecret` | GetUserWebhookSigningSecret returns the signing secret of a webhook. Only the owner may call it. The secret is |
| 79 | User Service | ImportMemos | POST | `/api/users/{user}:importMemos` | ImportMemos uploads a Memos export file in bounded chunks and imports it into the user's memos. The first call |
| 80 | User Service | ListLinkedIdentities | GET | `/api/users/{user}/linkedIdentities` | ListLinkedIdentities lists the SSO identities linked to a user. The user and admins may call it. |
| 81 | User Service | ListMemoViews | GET | `/api/users/{user}/views` | ListMemoViews lists a user's Views. Each view is a named, reusable CEL filter (see MemoView.filter); pass its  |
| 82 | User Service | ListPersonalAccessTokens | GET | `/api/users/{user}/personalAccessTokens` | ListPersonalAccessTokens lists a user's personal access tokens (PATs), without their token values. PATs are lo |
| 83 | User Service | ListUserNotifications | GET | `/api/users/{user}/notifications` | ListUserNotifications lists a user's notifications. Only the user may call it. Notifications whose memos or sp |
| 84 | User Service | ListUsers | GET | `/api/users` | ListUsers lists users in every state. Only admins may call it. |
| 85 | User Service | ListUserSettings | GET | `/api/users/{user}/settings` | ListUserSettings lists the settings of a user. Only the user may call it. The GENERAL setting is always includ |
| 86 | User Service | ListUserStats | GET | `/api/users/{user}/stats` | ListUserStats returns memo statistics for every user who created at least one matching memo the caller can rea |
| 87 | User Service | ListUserWebhooks | GET | `/api/users/{user}/webhooks` | ListUserWebhooks lists a user's webhooks. Only the user may call it. |
| 88 | User Service | UpdateMemoView | PATCH | `/api/users/{user}/views/{view}` | UpdateMemoView updates a View. Only the owner may call it. |
| 89 | User Service | UpdateUser | PATCH | `/api/users/{user}` | UpdateUser updates a user. Users may update themselves; admins may update anyone. Changing the password ends t |
| 90 | User Service | UpdateUserNotification | PATCH | `/api/users/{user}/notifications/{notification}` | UpdateUserNotification updates a notification's status. Only the receiver may call it. |
| 91 | User Service | UpdateUserSetting | PATCH | `/api/users/{user}/settings/{setting}` | UpdateUserSetting updates a user setting. Only the user may call it, and only the GENERAL and TAGS settings ca |
| 92 | User Service | UpdateUserWebhook | PATCH | `/api/users/{user}/webhooks/{webhook}` | UpdateUserWebhook updates a webhook. Only the owner may call it. |

## 文件

| 文件 | 内容 |
|------|------|
| _overview.md | API Reference 总览：Base URL / 认证 / 分页 / filter(AIP-160) / updateMask / 错误格式 |
| aiservice.md | AI Service — 1 个方法 |
| attachmentservice.md | Attachment Service — 7 个方法 |
| authservice.md | Auth Service — 4 个方法 |
| identityproviderservice.md | Identity Provider Service — 5 个方法 |
| instanceservice.md | Instance Service — 6 个方法 |
| memoservice.md | Memo Service — 20 个方法 |
| spaceservice.md | Space Service — 16 个方法 |
| userservice.md | User Service — 33 个方法 |

## 重要行为备注（2026-10-17 在实例实测）

- **tags 只读**：CreateMemo/UpdateMemo 请求体无 tags 字段；tags 由服务端从 content 的 `#hashtag` 解析，仅出现在响应的 `tags: string[]`
- **tag 过滤**：`filter="work" in tags` 或 `filter=tags.exists(t, t == "urgent")`（CEL，AIP-160）
- **全文搜索**：`filter=content.contains("kw")`
- **更新**：PATCH + `updateMask=content`（改 content 会重新解析 tags）
- **分页**：`pageSize` 默认 50 上限 1000；`nextPageToken` 翻页；`orderBy` 默认 `create_time desc`
