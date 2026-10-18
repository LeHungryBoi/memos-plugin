# Instance Service — 6 个方法

> Source: https://usememos.com/docs/api/latest/instanceservice  
> Crawled: 2026-10-17T03:04:16.727Z

## 方法目录

- [BatchGetInstanceSettings](#batchgetinstancesettings) — `POST /api/instance/settings:batchGet`
- [GetInstanceProfile](#getinstanceprofile) — `GET /api/instance/profile`
- [GetInstanceSetting](#getinstancesetting) — `GET /api/instance/{instance}/*`
- [GetInstanceStats](#getinstancestats) — `GET /api/instance/stats`
- [TestInstanceEmailSetting](#testinstanceemailsetting) — `POST /api/instance/settings/notification:testEmail`
- [UpdateInstanceSetting](#updateinstancesetting) — `PATCH /api/instance/{instance}/*`


---

## BatchGetInstanceSettings

> BatchGetInstanceSettings gets up to 100 instance settings in request order, with the same access rules as  GetInstanceSetting. The call fails if any setting cannot be returned.

`POST /api/instance/settings:batchGet`

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for InstanceService.BatchGetInstanceSettings.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/instance/settings:batchGet" \-H "Content-Type: application/json" \-d '{"names": ["string"]}'

200default

{"instanceSettings": [{"name": "string","generalSetting": {"customProfile": {"title": "string","description": "string","logoUrl": "string"},"disallowUserRegistration": true,"disallowPasswordAuth": true,"disallowChangeUsername": true,"disallowChangeNickname": true,"weekStartDayOffset": 0,"additionalStyle": "string","additionalScript": "string"},"storageSetting": {"storages": [{"id": "string","name": "string","type": "STORAGE_TYPE_UNSPECIFIED","s3Config": {"endpoint": "string","region": "string","bucket": "string","accessKeyId": "string","accessKeySecret": "string","usePathStyle": true,"insecureSkipTlsVerify": true}}],"defaultStorageId": "string","filepathTemplate": "string","uploadSizeLimitMb": "string","storageType": "STORAGE_TYPE_UNSPECIFIED","s3Config": {"endpoint": "string","region": "string","bucket": "string","accessKeyId": "string","accessKeySecret": "string","usePathStyle": true,"insecureSkipTlsVerify": true}},"memoRelatedSetting": {"contentLengthLimit": 0,"reactions": ["string"],"enableDoubleClickEdit": true},"tagsSetting": {"tags": {"property1": {"backgroundColor": {"red": 0.1,"green": 0.1,"blue": 0.1,"alpha": 0.1},"blurContent": true},"property2": {"backgroundColor": {"red": 0.1,"green": 0.1,"blue": 0.1,"alpha": 0.1},"blurContent": true}}},"notificationSetting": {"email": {"enabled": true,"smtpHost": "string","smtpPort": 0,"smtpUsername": "string","smtpPassword": "string","useTls": true,"useSsl": true,"fromEmail": "string","fromName": "string","replyTo": "string"}},"aiSetting": {"providers": [{"id": "string","title": "string","type": "AI_PROVIDER_TYPE_UNSPECIFIED","endpoint": "string","apiKey": "string","apiKeySet": true,"apiKeyHint": "string"}],"transcription": {"providerId": "string","model": "string","language": "string","prompt": "string"}},"accessSetting": {"accessMode": "INSTANCE_ACCESS_MODE_UNSPECIFIED"}}]}


---

## GetInstanceProfile

> GetInstanceProfile gets the instance profile. Available without authentication, including on a private instance.

`GET /api/instance/profile`

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/instance/profile"

200default

{"version": "string","commit": "string","demo": true,"instanceUrl": "string","accessMode": "INSTANCE_ACCESS_MODE_UNSPECIFIED","needsSetup": true,"admin": {"name": "string","username": "string","displayName": "string","email": "string","avatarUrl": "string","description": "string","password": "string","role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"},"challenge": {"provider": "string","siteKey": "string"}}


---

## GetInstanceSetting

> GetInstanceSetting gets an instance setting. Available without authentication, except STORAGE and NOTIFICATION,  which are admin only, and AI, which requires a signed-in user and hides transcription defaults from non-admins.

`GET /api/instance/{instance}/*`

## Path Parameters

instance*string

The instance id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/instance/string/*"

200default

{"name": "string","generalSetting": {"customProfile": {"title": "string","description": "string","logoUrl": "string"},"disallowUserRegistration": true,"disallowPasswordAuth": true,"disallowChangeUsername": true,"disallowChangeNickname": true,"weekStartDayOffset": 0,"additionalStyle": "string","additionalScript": "string"},"storageSetting": {"storages": [{"id": "string","name": "string","type": "STORAGE_TYPE_UNSPECIFIED","s3Config": {"endpoint": "string","region": "string","bucket": "string","accessKeyId": "string","accessKeySecret": "string","usePathStyle": true,"insecureSkipTlsVerify": true}}],"defaultStorageId": "string","filepathTemplate": "string","uploadSizeLimitMb": "string","storageType": "STORAGE_TYPE_UNSPECIFIED","s3Config": {"endpoint": "string","region": "string","bucket": "string","accessKeyId": "string","accessKeySecret": "string","usePathStyle": true,"insecureSkipTlsVerify": true}},"memoRelatedSetting": {"contentLengthLimit": 0,"reactions": ["string"],"enableDoubleClickEdit": true},"tagsSetting": {"tags": {"property1": {"backgroundColor": {"red": 0.1,"green": 0.1,"blue": 0.1,"alpha": 0.1},"blurContent": true},"property2": {"backgroundColor": {"red": 0.1,"green": 0.1,"blue": 0.1,"alpha": 0.1},"blurContent": true}}},"notificationSetting": {"email": {"enabled": true,"smtpHost": "string","smtpPort": 0,"smtpUsername": "string","smtpPassword": "string","useTls": true,"useSsl": true,"fromEmail": "string","fromName": "string","replyTo": "string"}},"aiSetting": {"providers": [{"id": "string","title": "string","type": "AI_PROVIDER_TYPE_UNSPECIFIED","endpoint": "string","apiKey": "string","apiKeySet": true,"apiKeyHint": "string"}],"transcription": {"providerId": "string","model": "string","language": "string","prompt": "string"}},"accessSetting": {"accessMode": "INSTANCE_ACCESS_MODE_UNSPECIFIED"}}


---

## GetInstanceStats

> GetInstanceStats gets resource usage statistics for the instance. Admin only. Results are cached for 60 seconds.

`GET /api/instance/stats`

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/instance/stats"

200default

{"database": {"driver": "string","sizeBytes": "string"},"localStorageBytes": "string","generatedTime": "2019-08-24T14:15:22Z"}


---

## TestInstanceEmailSetting

> TestInstanceEmailSetting sends a test email with the provided or stored SMTP settings. Admin only.

`POST /api/instance/settings/notification:testEmail`

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for InstanceService.TestInstanceEmailSetting.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/instance/settings/notification:testEmail" \-H "Content-Type: application/json" \-d '{}


---

## UpdateInstanceSetting

> UpdateInstanceSetting replaces an instance setting. Admin only. Settings configured by the deployment cannot be  updated. Empty write-only credentials keep the stored values.

`PATCH /api/instance/{instance}/*`

## Path Parameters

instance*string

The instance id.

## Query Parameters

updateMask?string

Optional. The list of fields to update. Currently ignored; the whole setting is replaced.

Formatfield-mask

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

InstanceSetting is one group of instance-wide settings, selected by its key.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/instance/string/*" \-H "Content-Type: application/json" \-d '{}'

200default

{"name": "string","generalSetting": {"customProfile": {"title": "string","description": "string","logoUrl": "string"},"disallowUserRegistration": true,"disallowPasswordAuth": true,"disallowChangeUsername": true,"disallowChangeNickname": true,"weekStartDayOffset": 0,"additionalStyle": "string","additionalScript": "string"},"storageSetting": {"storages": [{"id": "string","name": "string","type": "STORAGE_TYPE_UNSPECIFIED","s3Config": {"endpoint": "string","region": "string","bucket": "string","accessKeyId": "string","accessKeySecret": "string","usePathStyle": true,"insecureSkipTlsVerify": true}}],"defaultStorageId": "string","filepathTemplate": "string","uploadSizeLimitMb": "string","storageType": "STORAGE_TYPE_UNSPECIFIED","s3Config": {"endpoint": "string","region": "string","bucket": "string","accessKeyId": "string","accessKeySecret": "string","usePathStyle": true,"insecureSkipTlsVerify": true}},"memoRelatedSetting": {"contentLengthLimit": 0,"reactions": ["string"],"enableDoubleClickEdit": true},"tagsSetting": {"tags": {"property1": {"backgroundColor": {"red": 0.1,"green": 0.1,"blue": 0.1,"alpha": 0.1},"blurContent": true},"property2": {"backgroundColor": {"red": 0.1,"green": 0.1,"blue": 0.1,"alpha": 0.1},"blurContent": true}}},"notificationSetting": {"email": {"enabled": true,"smtpHost": "string","smtpPort": 0,"smtpUsername": "string","smtpPassword": "string","useTls": true,"useSsl": true,"fromEmail": "string","fromName": "string","replyTo": "string"}},"aiSetting": {"providers": [{"id": "string","title": "string","type": "AI_PROVIDER_TYPE_UNSPECIFIED","endpoint": "string","apiKey": "string","apiKeySet": true,"apiKeyHint": "string"}],"transcription": {"providerId": "string","model": "string","language": "string","prompt": "string"}},"accessSetting": {"accessMode": "INSTANCE_ACCESS_MODE_UNSPECIFIED"}}
