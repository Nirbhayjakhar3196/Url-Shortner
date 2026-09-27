URL Shortener --- Product Requirements Document (PRD)

1. Product Overview

The URL Shortener is a multi-user backend application that allows
authenticated users to create short URLs, manage their own shortened
URLs, and view click analytics.

A shortened URL can be shared publicly. Opening a short URL redirects
the visitor to the original URL and records a click.

2. Current Goal

Build a simple, reliable URL-shortening product with:

User registration and login

JWT-based authentication

Secure password hashing

User-owned shortened URLs

Public short-link redirection

Click analytics

URL listing for the authenticated user

URL deletion

Clear ownership/authorization rules

The frontend will consume the existing backend API and must not invent
new API contracts.

3. Target User

A registered user who wants to:

Create short links for long URLs.

Give each short link a meaningful title.

View all links they own.

See click statistics.

Delete links they no longer need.

Visitors who receive a short URL do not need an account to use it.

4. Core User Flows

Registration

User provides:

name

email

password

The backend hashes the password and stores the resulting passwordHash.

Login

User provides email and password.

The backend verifies the credentials and returns a JWT.

Protected requests use:

Authorization: Bearer <JWT>

Create Short URL

Authenticated user provides:

title

originalUrl

The backend generates a unique shortId and associates the URL with the
authenticated user's userId.

Open Short URL

Anyone can open:

GET /:shortId

No JWT is required.

The backend:

Finds the URL.

Increments clicks.

Updates lastClickedAt.

Redirects to originalUrl.

Manage URLs

Authenticated users can:

View their own URLs.

View analytics for their own URLs.

Delete their own URLs.

A user must not be able to manage another user's URL.

5. Authorization Rules

Registration and login are public.

Short-link redirection is public.

URL creation requires authentication.

User URL listing requires authentication.

Analytics requires authentication and ownership.

Deletion requires authentication and ownership.

The backend derives ownership from the verified JWT, not from a
userId supplied by the client.

6. Out of Scope for the Current Version

Do not assume these features exist:

Custom aliases

URL expiration

QR codes

Teams

Admin dashboard

Social login

Password reset

Email verification

Advanced geographic analytics

Browser/device analytics

Redis

Microservices

These can be considered future enhancements only if the backend API is
later extended.

7. Frontend Principles

The frontend should:

Use the documented API exactly.

Clearly distinguish public and authenticated pages/actions.

Store and send the JWT according to the chosen frontend
implementation.

Show useful loading, success, and error states.

Never expose passwordHash.

Never ask the user to provide userId when creating or managing a
URL.

Never assume undocumented response fields.

If a frontend requirement cannot be fulfilled using the documented API,
the implementation should stop and clarify the missing contract rather
than inventing one.