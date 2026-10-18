# Identity Provider Service — 5 个方法

> Source: https://usememos.com/docs/api/latest/identityproviderservice  
> Crawled: 2026-10-17T03:04:16.727Z

## 方法目录

- [CreateIdentityProvider](#createidentityprovider) — `POST /api/identity-providers`
- [DeleteIdentityProvider](#deleteidentityprovider) — `DELETE /api/identity-providers/{identity-provider}`
- [GetIdentityProvider](#getidentityprovider) — `GET /api/identity-providers/{identity-provider}`
- [ListIdentityProviders](#listidentityproviders) — `GET /api/identity-providers`
- [UpdateIdentityProvider](#updateidentityprovider) — `PATCH /api/identity-providers/{identity-provider}`


---

## CreateIdentityProvider

> CreateIdentityProvider creates an identity provider.  Requires the admin role. Fails with FAILED_PRECONDITION when the ID belongs to a provider configured by the  deployment.

`POST /api/identity-providers`

## Query Parameters

identityProviderId?string

Optional. The ID to use for the identity provider, which becomes the final component of the resource name.
If empty, the server generates one.
Format: ^a-zA-Z0-9?$

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

IdentityProvider is an external identity provider users can sign in with.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/identity-providers" \-H "Content-Type: application/json" \-d '{"type": "TYPE_UNSPECIFIED","title": "string","config": {}}'

200default

{"name": "string","type": "TYPE_UNSPECIFIED","title": "string","identifierFilter": "string","config": {"oauth2Config": {"clientId": "string","clientSecret": "string","authUrl": "string","tokenUrl": "string","userInfoUrl": "string","scopes": ["string"],"fieldMapping": {"identifier": "string","displayName": "string","email": "string","avatarUrl": "string"}}}}


---

## DeleteIdentityProvider

> DeleteIdentityProvider deletes an identity provider.  Requires the admin role. Providers configured by the deployment cannot be deleted. Fails with  FAILED_PRECONDITION when password sign-in is disabled for regular users and no other effective provider remains.

`DELETE /api/identity-providers/{identity-provider}`

## Path Parameters

identity-provider*string

The identity-provider id.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/identity-providers/string"

200default

Empty

Create Identity Provider

CreateIdentityProvider creates an identity provider.
 Requires the admin role. Fails with FAILED_PRECONDITION when the ID belongs to a provider configured by the
 deployment.Get Identity Provider

GetIdentityProvider gets an identity provider.
 The client secret is never returned.


---

## GetIdentityProvider

> GetIdentityProvider gets an identity provider.  The client secret is never returned.

`GET /api/identity-providers/{identity-provider}`

## Path Parameters

identity-provider*string

The identity-provider id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/identity-providers/string"

200default

{"name": "string","type": "TYPE_UNSPECIFIED","title": "string","identifierFilter": "string","config": {"oauth2Config": {"clientId": "string","clientSecret": "string","authUrl": "string","tokenUrl": "string","userInfoUrl": "string","scopes": ["string"],"fieldMapping": {"identifier": "string","displayName": "string","email": "string","avatarUrl": "string"}}}}


---

## ListIdentityProviders

> ListIdentityProviders lists identity providers.  Public, so the sign-in page can show SSO options. Client secrets are never returned.

`GET /api/identity-providers`

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/identity-providers"

200default

{"identityProviders": [{"name": "string","type": "TYPE_UNSPECIFIED","title": "string","identifierFilter": "string","config": {"oauth2Config": {"clientId": "string","clientSecret": "string","authUrl": "string","tokenUrl": "string","userInfoUrl": "string","scopes": ["string"],"fieldMapping": {"identifier": "string","displayName": "string","email": "string","avatarUrl": "string"}}}}]}


---

## UpdateIdentityProvider

> UpdateIdentityProvider updates an identity provider.  Requires the admin role. Providers configured by the deployment cannot be updated.

`PATCH /api/identity-providers/{identity-provider}`

## Path Parameters

identity-provider*string

The identity-provider id.

## Query Parameters

updateMask?string

Required. The fields to update. Supported paths: title, identifier_filter, config; other paths are ignored.
An empty OAuth2 client secret in config keeps the stored secret.

Formatfield-mask

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

IdentityProvider is an external identity provider users can sign in with.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/identity-providers/string" \-H "Content-Type: application/json" \-d '{"type": "TYPE_UNSPECIFIED","title": "string","config": {}}'

200default

{"name": "string","type": "TYPE_UNSPECIFIED","title": "string","identifierFilter": "string","config": {"oauth2Config": {"clientId": "string","clientSecret": "string","authUrl": "string","tokenUrl": "string","userInfoUrl": "string","scopes": ["string"],"fieldMapping": {"identifier": "string","displayName": "string","email": "string","avatarUrl": "string"}}}}
