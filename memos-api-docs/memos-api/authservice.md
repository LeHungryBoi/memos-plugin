# Auth Service — 4 个方法

> Source: https://usememos.com/docs/api/latest/authservice  
> Crawled: 2026-10-17T03:04:16.727Z

## 方法目录

- [GetCurrentUser](#getcurrentuser) — `GET /api/auth/me`
- [RefreshToken](#refreshtoken) — `POST /api/auth/refresh`
- [SignIn](#signin) — `POST /api/auth/signin`
- [SignOut](#signout) — `POST /api/auth/signout`


---

## GetCurrentUser

> GetCurrentUser returns the authenticated user, similar to OIDC's /userinfo endpoint.  When the caller is not signed in or the account is no longer active, clears the refresh token cookie and returns  UNAUTHENTICATED.

`GET /api/auth/me`

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/auth/me"

200default

{"user": {"name": "string","username": "string","displayName": "string","email": "string","avatarUrl": "string","description": "string","password": "string","role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}}


---

## RefreshToken

> RefreshToken exchanges the refresh token for a new access token.  The refresh token is read from the HttpOnly cookie and rotated: the old token is revoked and a new one with a  fresh 30-day expiry is set in the cookie.  Public, so it can be called after the access token has expired.

`POST /api/auth/refresh`

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for AuthService.RefreshToken.
It has no fields: the refresh token is read from the HttpOnly cookie.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/auth/refresh" \-H "Content-Type: application/json" \-d '{}'

200default

{"accessToken": "string","accessTokenExpireTime": "2019-08-24T14:15:22Z"}


---

## SignIn

> SignIn authenticates a user with password or SSO credentials.  On success, returns a short-lived access token and sets a refresh token in an HttpOnly cookie.  Public. Attempts are rate limited. Archived users cannot sign in.

`POST /api/auth/signin`

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for AuthService.SignIn.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/auth/signin" \-H "Content-Type: application/json" \-d '{}'

200default

{"user": {"name": "string","username": "string","displayName": "string","email": "string","avatarUrl": "string","description": "string","password": "string","role": "ROLE_UNSPECIFIED","state": "STATE_UNSPECIFIED","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"},"accessToken": "string","accessTokenExpireTime": "2019-08-24T14:15:22Z"}


---

## SignOut

> SignOut ends the current session.  Revokes the refresh token from the cookie and clears the cookie.

`POST /api/auth/signout`

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/auth/signout"

200default

Empty

Sign In

SignIn authenticates a user with password or SSO credentials.
 On success, returns a short-lived access token and sets a refresh token in an HttpOnly cookie.
 Public. Attempts are rate limited. Archived users cannot sign in.Create Identity Provider

CreateIdentityProvider creates an identity provider.
 Requires the admin role. Fails with FAILED_PRECONDITION when the ID belongs to a provider configured by the
 deployment.
