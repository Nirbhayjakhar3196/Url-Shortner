URL Shortener

A multi-user URL shortening backend built with Node.js, Express,
MongoDB, JWT authentication, and NanoID.

Users can register, log in, create shortened URLs, manage their own
URLs, view click analytics, and delete URLs. Public visitors can open
short URLs without authentication.

Features

User registration

Secure password hashing with bcrypt

JWT authentication

Protected APIs

URL ownership and authorization

Short URL generation with NanoID

Public URL redirection

Click tracking

Last-click timestamp

User-specific URL listing

URL analytics

URL deletion

MongoDB persistence

Tech Stack

Node.js

Express.js

MongoDB

Mongoose

JWT (jsonwebtoken)

bcryptjs

NanoID

dotenv

Project Structure

url-shortener/
├── server.js
├── app.js
├── package.json
├── .env
├── .gitignore
│
└── src/
    ├── config/
    │   └── db.js
    │
    ├── controllers/
    │   ├── authController.js
    │   └── urlController.js
    │
    ├── middleware/
    │   └── authMiddleware.js
    │
    ├── models/
    │   ├── User.js
    │   └── Url.js
    │
    └── routes/
        ├── authRoutes.js
        └── urlRoutes.js

Environment Variables

Create a .env file:

PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/url_shortener
BASE_URL=http://localhost:3000
JWT_SECRET=your_secret_key

Never commit .env or expose JWT_SECRET.

Installation

npm install

Run

node server.js

The API runs at:

http://localhost:3000

Main API

Method   Endpoint                    Auth

GET      /                         Public
POST     /auth/register            Public
POST     /auth/login               Public
POST     /url                      JWT
GET      /url/my                   JWT
GET      /url/analytics/:shortId   JWT
DELETE   /url/:shortId             JWT
GET      /:shortId                 Public

See API_DOCUMENTATION.md for the complete
API contract.

Authentication Flow

Register
   ↓
Login
   ↓
JWT returned
   ↓
Authorization: Bearer <JWT>
   ↓
Protected API
   ↓
Backend verifies JWT
   ↓
req.user.id

The backend uses the authenticated user's ID to establish URL ownership.

Data Model

User

User
├── _id
├── name
├── email
├── passwordHash
├── createdAt
└── updatedAt

URL

Url
├── _id
├── title
├── originalUrl
├── shortId
├── userId
├── clicks
├── lastClickedAt
├── createdAt
└── updatedAt

Relationship:

One User
   │
   ├── URL
   ├── URL
   └── URL

Security / Ownership

Protected URL operations use the user ID extracted from the verified
JWT.

The client must not be trusted to provide an arbitrary userId.

For example, analytics effectively checks:

shortId + authenticated userId

This prevents one user from managing another user's URLs.

Current Scope

The current version intentionally focuses on the core URL-shortener
product.

Not currently included:

Redis

Rate limiting

Automated tests

Docker

Deployment

Custom aliases

URL expiration

QR codes

Advanced geographic/device analytics

Admin dashboard

These can be added in later iterations.

Development Roadmap

Core URL Shortener              ✅
Authentication + Authorization  ✅
Frontend                         → Next
Security hardening               → Later
Automated testing                → Later
Docker + deployment              → Later

Frontend Integration Rule

The frontend must consume the existing API contract.

Do not invent endpoints, request fields, response fields, or backend
functionality.

If a required frontend feature is not supported by the current API,
update the backend contract intentionally before implementing the
frontend.

License

This project is for learning and portfolio purpo