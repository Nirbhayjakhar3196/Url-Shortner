URL Shortener API Documentation

Base URL

http://localhost:3000

Authentication

Protected endpoints require:

Authorization: Bearer <JWT>

The JWT is returned by POST /auth/login.

The frontend must not send a userId to establish ownership. The
backend obtains the authenticated user's ID from the verified JWT.

1. Health Check

GET /

Authentication: Not required.

Response --- 200

{
  "message": "URL Shortener API is running"
}

2. Register

POST /auth/register

Authentication: Not required.

Request Body

{
  "name": "Nirbhay",
  "email": "nirbhay@example.com",
  "password": "TestPass123!"
}

Success --- 201

{
  "message": "User registered successfully",
  "user": {
    "id": "USER_ID",
    "name": "Nirbhay",
    "email": "nirbhay@example.com"
  }
}

Errors

400

Missing name, email, or password.

{
  "message": "Name, email and password are required"
}

409

Email already exists.

{
  "message": "User already exists"
}

500

{
  "message": "Internal server error"
}

3. Login

POST /auth/login

Authentication: Not required.

Request Body

{
  "email": "nirbhay@example.com",
  "password": "TestPass123!"
}

Success --- 200

{
  "message": "Login successful",
  "token": "JWT_TOKEN"
}

Errors

400

Missing email or password.

401

Invalid email or password.

{
  "message": "Invalid email or password"
}

500

{
  "message": "Internal server error"
}

4. Create Short URL

POST /url

Authentication: Required.

Header

Authorization: Bearer <JWT>
Content-Type: application/json

Request Body

{
  "title": "My GitHub Profile",
  "originalUrl": "https://github.com"
}

Success --- 201

{
  "message": "Short URL created successfully",
  "title": "My GitHub Profile",
  "shortId": "abc1234",
  "shortUrl": "http://localhost:3000/abc1234"
}

Errors

400

Missing title/originalUrl, invalid URL, or unsupported protocol.

Supported protocols:

http:

https:

401

Missing, invalid, or expired JWT.

500

{
  "message": "Internal server error"
}

5. Get Current User's URLs

GET /url/my

Authentication: Required.

Header

Authorization: Bearer <JWT>

Success --- 200

{
  "count": 1,
  "urls": [
    {
      "_id": "URL_ID",
      "originalUrl": "https://github.com",
      "shortId": "abc1234",
      "title": "My GitHub Profile",
      "userId": "USER_ID",
      "clicks": 0,
      "lastClickedAt": null,
      "createdAt": "DATE",
      "updatedAt": "DATE"
    }
  ]
}

The backend returns only URLs owned by the authenticated user.

6. Get URL Analytics

GET /url/analytics/:shortId

Authentication: Required.

Header

Authorization: Bearer <JWT>

Example

GET /url/analytics/abc1234

Success --- 200

{
  "title": "My GitHub Profile",
  "shortId": "abc1234",
  "originalUrl": "https://github.com",
  "clicks": 5,
  "createdAt": "DATE",
  "lastClickedAt": "DATE"
}

Authorization

The URL must belong to the authenticated user.

If the URL does not exist or does not belong to the authenticated user:

404

{
  "message": "URL not found"
}

7. Delete URL

DELETE /url/:shortId

Authentication: Required.

Header

Authorization: Bearer <JWT>

Example

DELETE /url/abc1234

Success --- 200

{
  "message": "URL deleted successfully"
}

Errors

404

The URL does not exist or does not belong to the authenticated user.

{
  "message": "URL not found"
}

8. Public Redirect

GET /:shortId

Authentication: Not required.

Example

GET /abc1234

Behavior

The backend:

Finds the URL by shortId.

Increments clicks.

Updates lastClickedAt.

Redirects the requester to originalUrl.

Not Found --- 404

{
  "message": "Short URL not found"
}

This endpoint is intentionally public. A visitor should not need a JWT
just to open a shared short link.

API Contract Rules for Frontend

Do not invent endpoints.

Do not invent request fields.

Do not invent response fields.

Do not send userId when creating a URL.

Use the JWT to access protected endpoints.

Send JWT as Authorization: Bearer <JWT>.

Do not require authentication for public short-link redirects.

Treat API_DOCUMENTATION.md as the API source of truth.

If the frontend needs functionality that is not represented here, do
not silently assume a backend implementation.