# User Service — 33 个方法

> Source: https://usememos.com/docs/api/latest/userservice  
> Crawled: 2026-10-17T03:04:16.727Z

## 方法目录

- [BatchGetUsers](#batchgetusers) — `POST /api/users:batchGet`
- [CreateLinkedIdentity](#createlinkedidentity) — `POST /api/users/{user}/linkedIdentities`
- [CreateMemoView](#creatememoview) — `POST /api/users/{user}/views`
- [CreatePersonalAccessToken](#createpersonalaccesstoken) — `POST /api/users/{user}/personalAccessTokens`
- [CreateUser](#createuser) — `POST /api/users`
- [CreateUserWebhook](#createuserwebhook) — `POST /api/users/{user}/webhooks`
- [DeleteLinkedIdentity](#deletelinkedidentity) — `DELETE /api/users/{user}/linkedIdentities/{linkedIdentity}`
- [DeleteMemoView](#deletememoview) — `DELETE /api/users/{user}/views/{view}`
- [DeletePersonalAccessToken](#deletepersonalaccesstoken) — `DELETE /api/users/{user}/personalAccessTokens/{personalAccessToken}`
- [DeleteUser](#deleteuser) — `DELETE /api/users/{user}`
- [DeleteUserNotification](#deleteusernotification) — `DELETE /api/users/{user}/notifications/{notification}`
- [DeleteUserWebhook](#deleteuserwebhook) — `DELETE /api/users/{user}/webhooks/{webhook}`
- [ExportMemos](#exportmemos) — `GET /api/users/{user}:exportMemos`
- [GetLinkedIdentity](#getlinkedidentity) — `GET /api/users/{user}/linkedIdentities/{linkedIdentity}`
- [GetMemoView](#getmemoview) — `GET /api/users/{user}/views/{view}`
- [GetUser](#getuser) — `GET /api/users/{user}`
- [GetUserSetting](#getusersetting) — `GET /api/users/{user}/settings/{setting}`
- [GetUserStats](#getuserstats) — `GET /api/users/{user}:getStats`
- [GetUserWebhookSigningSecret](#getuserwebhooksigningsecret) — `GET /api/users/{user}/webhooks/{webhook}:getSigningSecret`
- [ImportMemos](#importmemos) — `POST /api/users/{user}:importMemos`
- [ListLinkedIdentities](#listlinkedidentities) — `GET /api/users/{user}/linkedIdentities`
- [ListMemoViews](#listmemoviews) — `GET /api/users/{user}/views`
- [ListPersonalAccessTokens](#listpersonalaccesstokens) — `GET /api/users/{user}/personalAccessTokens`
- [ListUserNotifications](#listusernotifications) — `GET /api/users/{user}/notifications`
- [ListUsers](#listusers) — `GET /api/users`
- [ListUserSettings](#listusersettings) — `GET /api/users/{user}/settings`
- [ListUserStats](#listuserstats) — `GET /api/users/{user}/stats`
- [ListUserWebhooks](#listuserwebhooks) — `GET /api/users/{user}/webhooks`
- [UpdateMemoView](#updatememoview) — `PATCH /api/users/{user}/views/{view}`
- [UpdateUser](#updateuser) — `PATCH /api/users/{user}`
- [UpdateUserNotification](#updateusernotification) — `PATCH /api/users/{user}/notifications/{notification}`
- [UpdateUserSetting](#updateusersetting) — `PATCH /api/users/{user}/settings/{setting}`
- [UpdateUserWebhook](#updateuserwebhook) — `PATCH /api/users/{user}/webhooks/{webhook}`


---

## BatchGetUsers

> BatchGetUsers gets active users by username. Usernames that match no  active user are omitted from the response.

`POST /api/users:batchGet`

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for UserService.BatchGetUsers.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/users:batchGet" \-H "Content-Type: application/json" \-d '{"names": ["string"]}'

200default

{"users": [{"name": "string","username": "string","displayName": "string","email": "string","avatarUrl": "string","description": "string","password": "string","role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}]}


---

## CreateLinkedIdentity

> CreateLinkedIdentity completes an OAuth flow and links the resulting SSO  identity to the authenticated user, who must be the parent.

`POST /api/users/{user}/linkedIdentities`

## Path Parameters

user*string

The user id.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for UserService.CreateLinkedIdentity.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/users/string/linkedIdentities" \-H "Content-Type: application/json" \-d '{"parent": "string","identityProvider": "string","code": "string","redirectUri": "string"}'

200default

{"name": "string","identityProvider": "string","externalUid": "string"}


---

## CreateMemoView

> CreateMemoView creates a View for a user. Only the user may call it.

`POST /api/users/{user}/views`

## Path Parameters

user*string

The user id.

## Query Parameters

validateOnly?boolean

Optional. If set, validate the request but do not create the View.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

MemoView is a user's saved memo filter.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/users/string/views" \-H "Content-Type: application/json" \-d '{"title": "string","filter": "string"}'

200default

{"name": "string","title": "string","filter": "string","icon": {"emoji": "string","lucide": "string"}}


---

## CreatePersonalAccessToken

> CreatePersonalAccessToken creates a personal access token for a user.  Only the user may call it. The token value is returned only once, in the  response.

`POST /api/users/{user}/personalAccessTokens`

## Path Parameters

user*string

The user id.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for UserService.CreatePersonalAccessToken.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/users/string/personalAccessTokens" \-H "Content-Type: application/json" \-d '{"parent": "string"}'

200default

{"personalAccessToken": {"name": "string","description": "string","createTime": "2019-08-24T14:15:22Z","expireTime": "2019-08-24T14:15:22Z","lastUseTime": "2019-08-24T14:15:22Z"},"token": "string"}


---

## CreateUser

> CreateUser creates a user. The first user of an instance becomes an admin.  Otherwise, unless an admin calls it, the instance must allow user  registration and password sign-up, and the new user gets the USER role.

`POST /api/users`

## Query Parameters

userId?string

Optional. The resource ID to use for this user. If set, it must equal
user.username and follow the username format.
Format: ^a-zA-Z0-9?$

validateOnly?boolean

Optional. If set, validate the request but do not create the user.

requestId?string

Optional. An idempotency token. Currently ignored.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

User is an account on the instance.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/users" \-H "Content-Type: application/json" \-d '{"username": "string","role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED"}'

200default

{"name": "string","username": "string","displayName": "string","email": "string","avatarUrl": "string","description": "string","password": "string","role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}


---

## CreateUserWebhook

> CreateUserWebhook creates a webhook for a user. Only the user may call it.  The service generates a signing secret when none is given.

`POST /api/users/{user}/webhooks`

## Path Parameters

user*string

The user id.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

UserWebhook is a webhook owned by a user.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/users/string/webhooks" \-H "Content-Type: application/json" \-d '{}'

200default

{"name": "string","displayName": "string","url": "string","signingSecret": "string","signingSecretSet": true,"createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}


---

## DeleteLinkedIdentity

> DeleteLinkedIdentity unlinks an SSO identity from a user. The user and  admins may call it.

`DELETE /api/users/{user}/linkedIdentities/{linkedIdentity}`

## Path Parameters

user*string

The user id.

linkedIdentity*string

The linkedIdentity id.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/users/string/linkedIdentities/string"

200default

Empty

Create User Webhook

CreateUserWebhook creates a webhook for a user. Only the user may call it.
 The service generates a signing secret when none is given.Delete View

DeleteMemoView deletes a View. Only the owner may call it.


---

## DeleteMemoView

> DeleteMemoView deletes a View. Only the owner may call it.

`DELETE /api/users/{user}/views/{view}`

## Path Parameters

user*string

The user id.

view*string

The view id.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/users/string/views/string"

200default

Empty

Delete Linked Identity

DeleteLinkedIdentity unlinks an SSO identity from a user. The user and
 admins may call it.Delete Personal Access Token

DeletePersonalAccessToken deletes a personal access token, which stops
 working immediately. Only the owner may call it.


---

## DeletePersonalAccessToken

> DeletePersonalAccessToken deletes a personal access token, which stops  working immediately. Only the owner may call it.

`DELETE /api/users/{user}/personalAccessTokens/{personalAccessToken}`

## Path Parameters

user*string

The user id.

personalAccessToken*string

The personalAccessToken id.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/users/string/personalAccessTokens/string"

200default

Empty

Delete View

DeleteMemoView deletes a View. Only the owner may call it.Delete User

DeleteUser deletes a user. Users may delete themselves; admins may delete
 anyone. A user who belongs to any space cannot be deleted.


---

## DeleteUser

> DeleteUser deletes a user. Users may delete themselves; admins may delete  anyone. A user who belongs to any space cannot be deleted.

`DELETE /api/users/{user}`

## Path Parameters

user*string

The user id.

## Query Parameters

force?boolean

Optional. Currently ignored; deleting a user who belongs to any space
fails with FAILED_PRECONDITION.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/users/string"

200default

Empty

Delete Personal Access Token

DeletePersonalAccessToken deletes a personal access token, which stops
 working immediately. Only the owner may call it.Delete User Notification

DeleteUserNotification permanently deletes a notification. Only the
 receiver may call it.


---

## DeleteUserNotification

> DeleteUserNotification permanently deletes a notification. Only the  receiver may call it.

`DELETE /api/users/{user}/notifications/{notification}`

## Path Parameters

user*string

The user id.

notification*string

The notification id.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/users/string/notifications/string"

200default

Empty

Delete User

DeleteUser deletes a user. Users may delete themselves; admins may delete
 anyone. A user who belongs to any space cannot be deleted.Delete User Webhook

DeleteUserWebhook deletes a webhook. Only the owner may call it.


---

## DeleteUserWebhook

> DeleteUserWebhook deletes a webhook. Only the owner may call it.

`DELETE /api/users/{user}/webhooks/{webhook}`

## Path Parameters

user*string

The user id.

webhook*string

The webhook id.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/users/string/webhooks/string"

200default

Empty

Delete User Notification

DeleteUserNotification permanently deletes a notification. Only the
 receiver may call it.Export Memos

ExportMemos writes every memo the user created, with comments, archived
 memos, and attachment files, as a Memos export file (a ZIP file, see
 docs/design/memos-export-format.md). Only the user may export their own
 memos. The body is the archive; content_type is its media type.


---

## ExportMemos

> ExportMemos writes every memo the user created, with comments, archived  memos, and attachment files, as a Memos export file (a ZIP file, see  docs/design/memos-export-format.md). Only the user may export their own  memos. The body is the archive; content_type is its media type.

`GET /api/users/{user}:exportMemos`

## Path Parameters

user*string

The user id.

## Response Body

### 200

*/*

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string:exportMemos"

200default

Empty

Delete User Webhook

DeleteUserWebhook deletes a webhook. Only the owner may call it.Get Linked Identity

GetLinkedIdentity gets an SSO identity linked to a user. The user and
 admins may call it.


---

## GetLinkedIdentity

> GetLinkedIdentity gets an SSO identity linked to a user. The user and  admins may call it.

`GET /api/users/{user}/linkedIdentities/{linkedIdentity}`

## Path Parameters

user*string

The user id.

linkedIdentity*string

The linkedIdentity id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string/linkedIdentities/string"

200default

{"name": "string","identityProvider": "string","externalUid": "string"}


---

## GetMemoView

> GetMemoView gets a View. Only the owner may call it.

`GET /api/users/{user}/views/{view}`

## Path Parameters

user*string

The user id.

view*string

The view id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string/views/string"

200default

{"name": "string","title": "string","filter": "string","icon": {"emoji": "string","lucide": "string"}}


---

## GetUser

> GetUser gets a user by resource name.

`GET /api/users/{user}`

## Path Parameters

user*string

The user id.

## Query Parameters

readMask?string

Optional. Currently ignored; all fields are returned.

Formatfield-mask

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string"

200default

{"name": "string","username": "string","displayName": "string","email": "string","avatarUrl": "string","description": "string","password": "string","role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}


---

## GetUserSetting

> GetUserSetting gets a user setting. Only the user may call it.

`GET /api/users/{user}/settings/{setting}`

## Path Parameters

user*string

The user id.

setting*string

The setting id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string/settings/string"

200default

{"name": "string","generalSetting": {"locale": "string","memoVisibility": "string","theme": "string","saveMediaMetadata": true},"webhooksSetting": {"webhooks": [{"name": "string","displayName": "string","url": "string","signingSecret": "string","signingSecretSet": true,"createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}]},"tagsSetting": {"tags": {"property1": {"backgroundColor": {"red": 0.1,"green": 0.1,"blue": 0.1,"alpha": 0.1},"blurContent": true},"property2": {"backgroundColor": {"red": 0.1,"green": 0.1,"blue": 0.1,"alpha": 0.1},"blurContent": true}}}}


---

## GetUserStats

> GetUserStats returns memo statistics for one user, counting the user's  memos that the caller can read.

`GET /api/users/{user}:getStats`

## Path Parameters

user*string

The user id.

## Query Parameters

filter?string

Optional. A CEL expression selecting the readable non-comment memos to
count. Supports the same fields as ListMemos, including space.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string:getStats"

200default

{"name": "string","totalMemoCount": 0,"memoTypeStats": {"linkCount": 0,"codeCount": 0,"todoCount": 0,"undoCount": 0},"tagCounts": {"property1": 0,"property2": 0},"pinnedMemos": ["string"],"memoCreatedTimestamps": ["2019-08-24T14:15:22Z"],"memoUpdatedTimestamps": ["2019-08-24T14:15:22Z"],"attachmentStorageBytes": "string"}


---

## GetUserWebhookSigningSecret

> GetUserWebhookSigningSecret returns the signing secret of a webhook. Only  the owner may call it. The secret is returned only through this call; it  is never included in List, Create or Update responses.

`GET /api/users/{user}/webhooks/{webhook}:getSigningSecret`

## Path Parameters

user*string

The user id.

webhook*string

The webhook id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string/webhooks/string:getSigningSecret"

200default

{"signingSecret": "string"}


---

## ImportMemos

> ImportMemos uploads a Memos export file in bounded chunks and imports it  into the user's memos. The first call carries the spec and returns an  upload_id; later calls carry that upload_id. A finishing call with  validate_only returns the plan and keeps the archive staged; a finishing  call without it imports and returns the report. Uploads are bound to the  authenticated user, expire after 30 minutes of inactivity, and do not  survive a server restart.

`POST /api/users/{user}:importMemos`

## Path Parameters

user*string

The user id.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for UserService.ImportMemos.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/users/string:importMemos" \-H "Content-Type: application/json" \-d '{"name": "string","writeOffset": "string"}'

200default

{"uploadId": "string","committedSize": "string","maxChunkSize": 0,"plan": {"exportTime": "2019-08-24T14:15:22Z","exporter": "string","generator": "string","memoCount": 0,"attachmentCount": 0,"new": 0,"existing": 0,"renamed": 0,"warnings": [{"memoUid": "string","message": "string"}]},"report": {"created": 0,"updated": 0,"skipped": 0,"failed": 0,"warnings": [{"memoUid": "string","message": "string"}],"failures": [{"memoUid": "string","message": "string"}]}}


---

## ListLinkedIdentities

> ListLinkedIdentities lists the SSO identities linked to a user. The user  and admins may call it.

`GET /api/users/{user}/linkedIdentities`

## Path Parameters

user*string

The user id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string/linkedIdentities"

200default

{"linkedIdentities": [{"name": "string","identityProvider": "string","externalUid": "string"}]}


---

## ListMemoViews

> ListMemoViews lists a user's Views. Each view is a named, reusable  CEL filter (see MemoView.filter); pass its filter string directly to the  ListMemos `filter` argument. Only the user may call it.

`GET /api/users/{user}/views`

## Path Parameters

user*string

The user id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string/views"

200default

{"memoViews": [{"name": "string","title": "string","filter": "string","icon": {"emoji": "string","lucide": "string"}}]}


---

## ListPersonalAccessTokens

> ListPersonalAccessTokens lists a user's personal access tokens (PATs),  without their token values. PATs are long-lived tokens for API and script  access, distinct from short-lived JWT access tokens. The user and admins  may call it.

`GET /api/users/{user}/personalAccessTokens`

## Path Parameters

user*string

The user id.

## Query Parameters

pageSize?integer

Optional. The maximum number of tokens to return. The service may return
fewer. Currently ignored; all tokens are returned in one page.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the
next page.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string/personalAccessTokens"

200default

{"personalAccessTokens": [{"name": "string","description": "string","createTime": "2019-08-24T14:15:22Z","expireTime": "2019-08-24T14:15:22Z","lastUseTime": "2019-08-24T14:15:22Z"}],"nextPageToken": "string"}


---

## ListUserNotifications

> ListUserNotifications lists a user's notifications. Only the user may call  it. Notifications whose memos or space invitation the user can no longer  read are left out.

`GET /api/users/{user}/notifications`

## Path Parameters

user*string

The user id.

## Query Parameters

pageSize?integer

Optional. The maximum number of notifications to return. The service may
return fewer. Currently ignored; all notifications are returned in one
page.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the
next page.

filter?string

Optional. A filter on the notifications. Currently ignored.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string/notifications"

200default

{"notifications": [{"name": "string","sender": "string","senderUser": {"name": "string","username": "string","displayName": "string","email": "string","avatarUrl": "string","description": "string","password": "string","role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"},"type": "TYPE_UNSPECIFIED","memoComment": {"memo": "string","relatedMemo": "string","memoSnippet": "string","relatedMemoSnippet": "string"},"memoMention": {"memo": "string","relatedMemo": "string","memoSnippet": "string","relatedMemoSnippet": "string"},"spaceInvitation": {"spaceInvitation": "string","space": {"name": "string","title": "string","description": "string","icon": {"emoji": "string","lucide": "string"},"currentUserRole": "ROLE_UNSPECIFIED","memberCount": 0},"role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED"},"status": "STATUS_UNSPECIFIED","createTime": "2019-08-24T14:15:22Z"}],"nextPageToken": "string"}


---

## ListUsers

> ListUsers lists users in every state. Only admins may call it.

`GET /api/users`

## Query Parameters

pageSize?integer

Optional. The maximum number of users to return. The service may return
fewer. If unspecified, at most 50 users are returned. The maximum value is
1000; values above 1000 are coerced to 1000.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the
next page.

filter?string

Optional. A CEL filter on the users. Only username == '<username>' is
supported.
Example: "username == 'steven'"

showDeleted?boolean

Optional. Currently ignored; the list includes users in every state.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users"

200default

{"users": [{"name": "string","username": "string","displayName": "string","email": "string","avatarUrl": "string","description": "string","password": "string","role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}],"nextPageToken": "string"}


---

## ListUserSettings

> ListUserSettings lists the settings of a user. Only the user may call it.  The GENERAL setting is always included, with defaults when it was never  saved.

`GET /api/users/{user}/settings`

## Path Parameters

user*string

The user id.

## Query Parameters

pageSize?integer

Optional. The maximum number of settings to return. The service may return
fewer. Currently ignored; all settings are returned in one page.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the
next page.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string/settings"

200default

{"userSettings": [{"name": "string","generalSetting": {"locale": "string","memoVisibility": "string","theme": "string","saveMediaMetadata": true},"webhooksSetting": {"webhooks": [{"name": "string","displayName": "string","url": "string","signingSecret": "string","signingSecretSet": true,"createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}]},"tagsSetting": {"tags": {"property1": {"backgroundColor": {"red": 0.1,"green": 0.1,"blue": 0.1,"alpha": 0.1},"blurContent": true},"property2": {"backgroundColor": {"red": 0.1,"green": 0.1,"blue": 0.1,"alpha": 0.1},"blurContent": true}}}}],"nextPageToken": "string"}

List User Notifications

ListUserNotifications lists a user's notifications. Only the user may call
 it. Notifications whose memos or space invitation the user can no longer
 read are left out.List User Stats

ListUserStats returns memo statistics for every user who created at least
 one matching memo the caller can read. Use the parent users/- for all
 users, or users/{user}


---

## ListUserStats

> ListUserStats returns memo statistics for every user who created at least  one matching memo the caller can read. Use the parent users/- for all  users, or users/{user} for one user.

`GET /api/users/{user}/stats`

## Path Parameters

user*string

The user id.

## Query Parameters

filter?string

Optional. A CEL expression selecting the memos to count. Uses the same
filter syntax as ListMemos.

state?string

Optional. The state of the memos to count. Defaults to NORMAL. ARCHIVED
counts only the caller's own memos.

Formatenum

Value in

- "STATE_UNSPECIFIED"
- "NORMAL"
- "ARCHIVED"

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string/stats"

200default

{"userStats": [{"name": "string","totalMemoCount": 0,"memoTypeStats": {"linkCount": 0,"codeCount": 0,"todoCount": 0,"undoCount": 0},"tagCounts": {"property1": 0,"property2": 0},"pinnedMemos": ["string"],"memoCreatedTimestamps": ["2019-08-24T14:15:22Z"],"memoUpdatedTimestamps": ["2019-08-24T14:15:22Z"],"attachmentStorageBytes": "string"}]}


---

## ListUserWebhooks

> ListUserWebhooks lists a user's webhooks. Only the user may call it.

`GET /api/users/{user}/webhooks`

## Path Parameters

user*string

The user id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string/webhooks"

200default

{"webhooks": [{"name": "string","displayName": "string","url": "string","signingSecret": "string","signingSecretSet": true,"createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}]}

List User Stats

ListUserStats returns memo statistics for every user who created at least
 one matching memo the caller can read. Use the parent users/- for all
 users, or users/{user}


---

## UpdateMemoView

> UpdateMemoView updates a View. Only the owner may call it.

`PATCH /api/users/{user}/views/{view}`

## Path Parameters

user*string

The user id.

view*string

The view id.

## Query Parameters

updateMask?string

Optional. The fields to update. Supported paths: title, filter, icon. The
service rejects an empty mask.

Formatfield-mask

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

MemoView is a user's saved memo filter.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/users/string/views/string" \-H "Content-Type: application/json" \-d '{"title": "string","filter": "string"}'

200default

{"name": "string","title": "string","filter": "string","icon": {"emoji": "string","lucide": "string"}}


---

## UpdateUser

> UpdateUser updates a user. Users may update themselves; admins may update  anyone. Changing the password ends the user's other sessions.

`PATCH /api/users/{user}`

## Path Parameters

user*string

The user id.

## Query Parameters

updateMask?string

Required. The fields to update. Supported paths: username, display_name,
email, avatar_url, description, password, role, state. role and state
require an admin.

Formatfield-mask

allowMissing?boolean

Optional. Currently ignored; updating a missing user fails with NOT_FOUND.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

User is an account on the instance.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/users/string" \-H "Content-Type: application/json" \-d '{"username": "string","role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED"}'

200default

{"name": "string","username": "string","displayName": "string","email": "string","avatarUrl": "string","description": "string","password": "string","role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}


---

## UpdateUserNotification

> UpdateUserNotification updates a notification's status. Only the receiver  may call it.

`PATCH /api/users/{user}/notifications/{notification}`

## Path Parameters

user*string

The user id.

notification*string

The notification id.

## Query Parameters

updateMask?string

Required. The fields to update. Only status is supported.

Formatfield-mask

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

UserNotification is a notification delivered to a user.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/users/string/notifications/string" \-H "Content-Type: application/json" \-d '{}'

200default

{"name": "string","sender": "string","senderUser": {"name": "string","username": "string","displayName": "string","email": "string","avatarUrl": "string","description": "string","password": "string","role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"},"type": "TYPE_UNSPECIFIED","memoComment": {"memo": "string","relatedMemo": "string","memoSnippet": "string","relatedMemoSnippet": "string"},"memoMention": {"memo": "string","relatedMemo": "string","memoSnippet": "string","relatedMemoSnippet": "string"},"spaceInvitation": {"spaceInvitation": "string","space": {"name": "string","title": "string","description": "string","icon": {"emoji": "string","lucide": "string"},"currentUserRole": "ROLE_UNSPECIFIED","memberCount": 0},"role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED"},"status": "STATUS_UNSPECIFIED","createTime": "2019-08-24T14:15:22Z"}


---

## UpdateUserSetting

> UpdateUserSetting updates a user setting. Only the user may call it, and  only the GENERAL and TAGS settings can be updated.

`PATCH /api/users/{user}/settings/{setting}`

## Path Parameters

user*string

The user id.

setting*string

The setting id.

## Query Parameters

updateMask?string

Required. The fields to update, relative to the setting value. GENERAL
supports locale, memo_visibility, theme and save_media_metadata; TAGS
supports tags.

Formatfield-mask

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

UserSetting is one group of a user's preferences, identified by its key.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/users/string/settings/string" \-H "Content-Type: application/json" \-d '{}'

200default

{"name": "string","generalSetting": {"locale": "string","memoVisibility": "string","theme": "string","saveMediaMetadata": true},"webhooksSetting": {"webhooks": [{"name": "string","displayName": "string","url": "string","signingSecret": "string","signingSecretSet": true,"createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}]},"tagsSetting": {"tags": {"property1": {"backgroundColor": {"red": 0.1,"green": 0.1,"blue": 0.1,"alpha": 0.1},"blurContent": true},"property2": {"backgroundColor": {"red": 0.1,"green": 0.1,"blue": 0.1,"alpha": 0.1},"blurContent": true}}}}


---

## UpdateUserWebhook

> UpdateUserWebhook updates a webhook. Only the owner may call it.

`PATCH /api/users/{user}/webhooks/{webhook}`

## Path Parameters

user*string

The user id.

webhook*string

The webhook id.

## Query Parameters

updateMask?string

The fields to update. Supported paths: url, display_name, signing_secret.
When unset, all of them are updated, skipping an empty url or
signing_secret.

Formatfield-mask

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

UserWebhook is a webhook owned by a user.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/users/string/webhooks/string" \-H "Content-Type: application/json" \-d '{}'

200default

{"name": "string","displayName": "string","url": "string","signingSecret": "string","signingSecretSet": true,"createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}
