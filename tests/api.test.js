const request = require("supertest");
const jwt = require("jsonwebtoken");

// Set test environment variables
process.env.JWT_SECRET = "test_jwt_secret_key_12345";
process.env.PORT = "3000";
process.env.BASE_URL = "http://localhost:3000";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.GOOGLE_CLIENT_ID = "test_google_client_id";
process.env.GOOGLE_CLIENT_SECRET = "test_google_client_secret";
process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/google/callback";

// Mock email utility
jest.mock("../src/utils/email", () => ({
    sendOtpEmail: jest.fn().mockResolvedValue(true)
}));

// Mock redis
jest.mock("../src/config/redis", () => {
    const mockStore = new Map();
    return {
        redisClient: {
            isOpen: true,
            connect: jest.fn().mockResolvedValue(true),
            on: jest.fn(),
            set: jest.fn(async (key, value) => {
                mockStore.set(key, value);
                return "OK";
            }),
            get: jest.fn(async (key) => {
                return mockStore.get(key) || null;
            }),
            getDel: jest.fn(async (key) => {
                const val = mockStore.get(key) || null;
                mockStore.delete(key);
                return val;
            }),
            del: jest.fn(async (key) => {
                const existed = mockStore.delete(key);
                return existed ? 1 : 0;
            }),
            exists: jest.fn(async (key) => {
                return mockStore.has(key) ? 1 : 0;
            }),
            eval: jest.fn().mockResolvedValue([1, 10, 0]) // allow rate limit by default
        },
        connectRedis: jest.fn().mockResolvedValue(true)
    };
});

// Mock models
jest.mock("../src/models/User", () => {
    const users = [];
    return {
        findOne: jest.fn(async (query) => {
            if (query.email) return users.find(u => u.email === query.email) || null;
            if (query.googleId) return users.find(u => u.googleId === query.googleId) || null;
            return null;
        }),
        findById: jest.fn(async (id) => {
            return users.find(u => u._id === id) || null;
        }),
        create: jest.fn(async (doc) => {
            const newUser = { _id: "user_12345", ...doc, save: jest.fn().mockResolvedValue(true) };
            users.push(newUser);
            return newUser;
        }),
        findByIdAndUpdate: jest.fn().mockResolvedValue(true)
    };
});

jest.mock("../src/models/Url", () => {
    const urls = [];
    return {
        findOne: jest.fn(async (query) => {
            if (query.shortId) return urls.find(u => u.shortId === query.shortId) || null;
            return null;
        }),
        find: jest.fn(() => ({
            sort: jest.fn().mockResolvedValue(urls)
        })),
        create: jest.fn(async (doc) => {
            const newUrl = {
                _id: "url_12345",
                clicks: 0,
                createdAt: new Date(),
                ...doc,
                save: jest.fn().mockResolvedValue(true)
            };
            urls.push(newUrl);
            return newUrl;
        }),
        findOneAndDelete: jest.fn(async (query) => {
            const idx = urls.findIndex(u => u.shortId === query.shortId);
            if (idx !== -1) {
                const [deleted] = urls.splice(idx, 1);
                return deleted;
            }
            return null;
        })
    };
});

const app = require("../app");

describe("1. Basic & Health Endpoints", () => {
    test("GET / should return API running message", async () => {
        const res = await request(app).get("/");
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("URL Shortener API is running");
    });

    test("GET /health should return status ok", async () => {
        const res = await request(app).get("/health");
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("ok");
    });
});

describe("2. Auth Endpoints & Validation", () => {
    test("POST /auth/register should validate missing fields", async () => {
        const res = await request(app).post("/auth/register").send({ email: "test@example.com" });
        expect(res.status).toBe(400);
        expect(res.body.message || res.body.error).toBeDefined();
    });

    test("POST /auth/register should succeed with valid data", async () => {
        const res = await request(app).post("/auth/register").send({
            name: "Test User",
            email: "testuser@example.com",
            password: "Password123!"
        });
        expect(res.status).toBe(201);
        expect(res.body.message).toBe("User registered successfully");
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe("testuser@example.com");
    });

    test("POST /auth/login should reject invalid credentials format", async () => {
        const res = await request(app).post("/auth/login").send({ email: "invalid-email" });
        expect(res.status).toBe(400);
    });

    test("POST /auth/forgot-password should return generic message for security", async () => {
        const res = await request(app).post("/auth/forgot-password").send({
            email: "testuser@example.com"
        });
        expect(res.status).toBe(200);
        expect(res.body.message).toContain("OTP has been sent");
    });
});

describe("3. Google OAuth Flow", () => {
    test("GET /auth/google should redirect to Google accounts URL", async () => {
        const res = await request(app).get("/auth/google");
        expect(res.status).toBe(302);
        const location = res.headers.location;
        expect(location).toContain("accounts.google.com");
        expect(location).toContain("client_id=test_google_client_id");
        expect(location).toContain("state=");
    });

    test("GET /auth/google/callback with missing code should redirect to login error", async () => {
        const res = await request(app).get("/auth/google/callback");
        expect(res.status).toBe(302);
        expect(res.headers.location).toContain("/login?error=invalid_google_response");
    });

    test("POST /auth/google/exchange should return 400 when code is missing", async () => {
        const res = await request(app).post("/auth/google/exchange").send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Google exchange code is required");
    });
});

describe("4. URL Management & Protection", () => {
    let authToken;

    beforeAll(() => {
        authToken = jwt.sign(
            { id: "user_12345", name: "Test User", email: "testuser@example.com" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
    });

    test("POST /url should reject requests without token (401)", async () => {
        const res = await request(app).post("/url").send({
            title: "GitHub",
            originalUrl: "https://github.com"
        });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("No token provided");
    });

    test("POST /url should create short URL when authenticated", async () => {
        const res = await request(app)
            .post("/url")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                title: "GitHub Home",
                originalUrl: "https://github.com"
            });
        expect(res.status).toBe(201);
        expect(res.body.shortId).toBeDefined();
        expect(res.body.shortUrl).toContain(res.body.shortId);
    });

    test("GET /url/my should return list of user URLs", async () => {
        const res = await request(app)
            .get("/url/my")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.urls)).toBe(true);
    });

    test("GET /url/my should reject invalid tokens (401)", async () => {
        const res = await request(app)
            .get("/url/my")
            .set("Authorization", "Bearer invalid.fake.token");
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid or expired token");
    });

    test("DELETE /url/:shortId should return 404 for non-existent URL", async () => {
        const res = await request(app)
            .delete("/url/notfound123")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(404);
    });

    test("GET /:shortId should return 400 if short URL is not found", async () => {
        const res = await request(app).get("/notexist123");
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Short URL not found");
    });
});

describe("5. OTP & Reset Password Edge Cases", () => {
    test("POST /auth/verify-otp should reject non-6-digit OTP", async () => {
        const res = await request(app).post("/auth/verify-otp").send({
            email: "testuser@example.com",
            otp: "123" // less than 6 digits
        });
        expect(res.status).toBe(400);
    });

    test("POST /auth/reset-password should reject short newPassword", async () => {
        const res = await request(app).post("/auth/reset-password").send({
            resetToken: "some_token_123",
            newPassword: "short"
        });
        expect(res.status).toBe(400);
    });
});
