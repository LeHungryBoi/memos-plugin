# Space Service — 16 个方法

> Source: https://usememos.com/docs/api/latest/spaceservice  
> Crawled: 2026-10-17T03:04:16.727Z

## 方法目录

- [AcceptSpaceInvitation](#acceptspaceinvitation) — `POST /api/spaces/{space}/invitations/{invitation}:accept`
- [CreateSpace](#createspace) — `POST /api/spaces`
- [CreateSpaceInvitation](#createspaceinvitation) — `POST /api/spaces/{space}/invitations`
- [DeclineSpaceInvitation](#declinespaceinvitation) — `POST /api/spaces/{space}/invitations/{invitation}:decline`
- [DeleteSpace](#deletespace) — `DELETE /api/spaces/{space}`
- [DeleteSpaceInvitation](#deletespaceinvitation) — `DELETE /api/spaces/{space}/invitations/{invitation}`
- [DeleteSpaceMember](#deletespacemember) — `DELETE /api/spaces/{space}/members/{member}`
- [GetSpace](#getspace) — `GET /api/spaces/{space}`
- [GetSpaceInvitation](#getspaceinvitation) — `GET /api/spaces/{space}/invitations/{invitation}`
- [GetSpaceMember](#getspacemember) — `GET /api/spaces/{space}/members/{member}`
- [ListSpaceInvitations](#listspaceinvitations) — `GET /api/spaces/{space}/invitations`
- [ListSpaceMembers](#listspacemembers) — `GET /api/spaces/{space}/members`
- [ListSpaces](#listspaces) — `GET /api/spaces`
- [ListUserSpaceInvitations](#listuserspaceinvitations) — `GET /api/users/{user}/spaceInvitations`
- [UpdateSpace](#updatespace) — `PATCH /api/spaces/{space}`
- [UpdateSpaceMember](#updatespacemember) — `PATCH /api/spaces/{space}/members/{member}`


---

## AcceptSpaceInvitation

> AcceptSpaceInvitation accepts a pending invitation and creates a  membership with the invited role. Only the invitee can accept it.

`POST /api/spaces/{space}/invitations/{invitation}:accept`

## Path Parameters

space*string

The space id.

invitation*string

The invitation id.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for SpaceService.AcceptSpaceInvitation.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/spaces/string/invitations/string:accept" \-H "Content-Type: application/json" \-d '{"name": "string"}'

200default

{"name": "string","user": "string","role": "ROLE_UNSPECIFIED"}


---

## CreateSpace

> CreateSpace creates a space and makes the authenticated caller its first  administrator.

`POST /api/spaces`

## Query Parameters

spaceId?string

Optional. The ID to use for the space, which becomes the final segment of
its resource name. If empty, a UUID v4 is generated. Must match
^a-zA-Z0-9?$.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Space is a collaboration boundary for placed memos.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/spaces" \-H "Content-Type: application/json" \-d '{"title": "string"}'

200default

{"name": "string","title": "string","description": "string","icon": {"emoji": "string","lucide": "string"},"currentUserRole": "ROLE_UNSPECIFIED","memberCount": 0}


---

## CreateSpaceInvitation

> CreateSpaceInvitation invites an existing active user to a space. Only a  space administrator can invite. The invitee gets no space access until  they accept.

`POST /api/spaces/{space}/invitations`

## Path Parameters

space*string

The space id.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

SpaceInvitation is a pending invitation for an existing user to join a space.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/spaces/string/invitations" \-H "Content-Type: application/json" \-d '{"invitee": "string","role": "ROLE_UNSPECIFIED"}'

200default

{"name": "string","invitee": "string","role": "ROLE_UNSPECIFIED","space": {"name": "string","title": "string","description": "string","icon": {"emoji": "string","lucide": "string"},"currentUserRole": "ROLE_UNSPECIFIED","memberCount": 0}}


---

## DeclineSpaceInvitation

> DeclineSpaceInvitation declines a pending invitation without creating a  membership. Only the invitee can decline it.

`POST /api/spaces/{space}/invitations/{invitation}:decline`

## Path Parameters

space*string

The space id.

invitation*string

The invitation id.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for SpaceService.DeclineSpaceInvitation.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/spaces/string/invitations/string:decline" \-H "Content-Type: application/json" \-d '{"name": "string"}


---

## DeleteSpace

> DeleteSpace permanently deletes a space and every memo currently placed  in it. It never follows memo relations to other memos. Only a space  administrator can delete a space.

`DELETE /api/spaces/{space}`

## Path Parameters

space*string

The space id.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/spaces/string"

200default

Empty

Decline Space Invitation

DeclineSpaceInvitation declines a pending invitation without creating a
 membership. Only the invitee can decline it.Delete Space Invitation

DeleteSpaceInvitation revokes a pending invitation. Only a space
 administrator can revoke it.


---

## DeleteSpaceInvitation

> DeleteSpaceInvitation revokes a pending invitation. Only a space  administrator can revoke it.

`DELETE /api/spaces/{space}/invitations/{invitation}`

## Path Parameters

space*string

The space id.

invitation*string

The invitation id.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/spaces/string/invitations/string"

200default

Empty

Delete Space

DeleteSpace permanently deletes a space and every memo currently placed
 in it. It never follows memo relations to other memos. Only a space
 administrator can delete a space.Delete Space Member

DeleteSpaceMember removes a member. A space administrator can remove any
 member, and a member may delete their own membership to leave the space.
 A space must keep at least one administrator.


---

## DeleteSpaceMember

> DeleteSpaceMember removes a member. A space administrator can remove any  member, and a member may delete their own membership to leave the space.  A space must keep at least one administrator.

`DELETE /api/spaces/{space}/members/{member}`

## Path Parameters

space*string

The space id.

member*string

The member id.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/spaces/string/members/string"

200default

Empty

Delete Space Invitation

DeleteSpaceInvitation revokes a pending invitation. Only a space
 administrator can revoke it.Get Space

GetSpace gets a space of which the authenticated caller is a member.
 Spaces the caller is not a member of are reported as not found.


---

## GetSpace

> GetSpace gets a space of which the authenticated caller is a member.  Spaces the caller is not a member of are reported as not found.

`GET /api/spaces/{space}`

## Path Parameters

space*string

The space id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/spaces/string"

200default

{"name": "string","title": "string","description": "string","icon": {"emoji": "string","lucide": "string"},"currentUserRole": "ROLE_UNSPECIFIED","memberCount": 0}


---

## GetSpaceInvitation

> GetSpaceInvitation gets one pending invitation. Only the invitee or a  space administrator can get it.

`GET /api/spaces/{space}/invitations/{invitation}`

## Path Parameters

space*string

The space id.

invitation*string

The invitation id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/spaces/string/invitations/string"

200default

{"name": "string","invitee": "string","role": "ROLE_UNSPECIFIED","space": {"name": "string","title": "string","description": "string","icon": {"emoji": "string","lucide": "string"},"currentUserRole": "ROLE_UNSPECIFIED","memberCount": 0}}


---

## GetSpaceMember

> GetSpaceMember gets one membership in a space. The caller must be a member  of the space.

`GET /api/spaces/{space}/members/{member}`

## Path Parameters

space*string

The space id.

member*string

The member id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/spaces/string/members/string"

200default

{"name": "string","user": "string","role": "ROLE_UNSPECIFIED"}


---

## ListSpaceInvitations

> ListSpaceInvitations lists the pending invitations for a space. Only a  space administrator can list them.

`GET /api/spaces/{space}/invitations`

## Path Parameters

space*string

The space id.

## Query Parameters

pageSize?integer

Optional. The maximum number of invitations to return. The service may return fewer.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the next page.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/spaces/string/invitations"

200default

{"spaceInvitations": [{"name": "string","invitee": "string","role": "ROLE_UNSPECIFIED","space": {"name": "string","title": "string","description": "string","icon": {"emoji": "string","lucide": "string"},"currentUserRole": "ROLE_UNSPECIFIED","memberCount": 0}}],"nextPageToken": "string"}


---

## ListSpaceMembers

> ListSpaceMembers lists the members of a space. The caller must be a member  of the space.

`GET /api/spaces/{space}/members`

## Path Parameters

space*string

The space id.

## Query Parameters

pageSize?integer

Optional. The maximum number of members to return. The service may return fewer.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the next page.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/spaces/string/members"

200default

{"spaceMembers": [{"name": "string","user": "string","role": "ROLE_UNSPECIFIED"}],"nextPageToken": "string"}


---

## ListSpaces

> ListSpaces lists the spaces of which the authenticated caller is a member.

`GET /api/spaces`

## Query Parameters

pageSize?integer

Optional. The maximum number of spaces to return. The service may return fewer.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the next page.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/spaces"

200default

{"spaces": [{"name": "string","title": "string","description": "string","icon": {"emoji": "string","lucide": "string"},"currentUserRole": "ROLE_UNSPECIFIED","memberCount": 0}],"nextPageToken": "string"}


---

## ListUserSpaceInvitations

> ListUserSpaceInvitations lists the authenticated user's pending space  invitations. A user cannot list another user's invitations.

`GET /api/users/{user}/spaceInvitations`

## Path Parameters

user*string

The user id.

## Query Parameters

pageSize?integer

Optional. The maximum number of invitations to return. The service may return fewer.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the next page.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/users/string/spaceInvitations"

200default

{"spaceInvitations": [{"name": "string","invitee": "string","role": "ROLE_UNSPECIFIED","space": {"name": "string","title": "string","description": "string","icon": {"emoji": "string","lucide": "string"},"currentUserRole": "ROLE_UNSPECIFIED","memberCount": 0}}],"nextPageToken": "string"}


---

## UpdateSpace

> UpdateSpace updates space metadata. Only a space administrator can update  a space.

`PATCH /api/spaces/{space}`

## Path Parameters

space*string

The space id.

## Query Parameters

updateMask?string

Required. The fields to update. Supported paths: title, description, icon.

Formatfield-mask

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Space is a collaboration boundary for placed memos.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/spaces/string" \-H "Content-Type: application/json" \-d '{"title": "string"}'

200default

{"name": "string","title": "string","description": "string","icon": {"emoji": "string","lucide": "string"},"currentUserRole": "ROLE_UNSPECIFIED","memberCount": 0}


---

## UpdateSpaceMember

> UpdateSpaceMember changes a member's space role. Only a space administrator  can change roles, and a space must keep at least one administrator.

`PATCH /api/spaces/{space}/members/{member}`

## Path Parameters

space*string

The space id.

member*string

The member id.

## Query Parameters

updateMask?string

Required. The fields to update. Must include role. The user path is also
accepted, but the user must match the existing member and is never changed.

Formatfield-mask

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

SpaceMember is a user's membership and governance role in a space.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/spaces/string/members/string" \-H "Content-Type: application/json" \-d '{"user": "string","role": "ROLE_UNSPECIFIED"}'

200default

{"name": "string","user": "string","role": "ROLE_UNSPECIFIED"}
