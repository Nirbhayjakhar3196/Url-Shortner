const request = require("supertest");
const bcrypt = require("bcryptjs");

process.env.JWT_SECRET = "test_jwt_secret_key_12345";
process.env.PORT = "3000";
process.env.BASE_URL = "http://localhost:3000";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.GOOGLE_CLIENT_ID = "test_google_client_id";
process.env.GOOGLE_CLIENT_SECRET = "test_google_client_secret";
process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/google/callback";

// In-memory Redis simulation with real TTL and key handling
const mockRedisStore = new Map();
const mockRedisExpiry = new Map();

jest.mock("../src/config/redis", () => {
    return {
        redisClient: {
            isOpen: true,
            connect: jest.fn().mockResolvedValue(true),
            on: jest.fn(),
            set: jest.fn(async (key, value, options) => {
                mockRedisStore.set(key, value);
                if (options && options.EX) {
                    mockRedisExpiry.set(key, Date.now() + options.EX * 1000);
                } else if (!options || !options.KEEPTTL) {
                    mockRedisExpiry.delete(key);
                }
                return "OK";
            }),
            get: jest.fn(async (key) => {
                if (mockRedisExpiry.has(key) && Date.now() > mockRedisExpiry.get(key)) {
                    mockRedisStore.delete(key);
                    mockRedisExpiry.delete(key);
                    return null;
                }
                return mockRedisStore.get(key) || null;
            }),
            del: jest.fn(async (key) => {
                const existed = mockRedisStore.delete(key);
                mockRedisExpiry.delete(key);
                return existed ? 1 : 0;
            }),
            exists: jest.fn(async (key) => {
                if (mockRedisExpiry.has(key) && Date.now() > mockRedisExpiry.get(key)) {
                    mockRedisStore.delete(key);
                    mockRedisExpiry.delete(key);
                    return 0;
                }
                return mockRedisStore.has(key) ? 1 : 0;
            }),
            eval: jest.fn().mockResolvedValue([1, 10, 0])
        },
        connectRedis: jest.fn().mockResolvedValue(true)
    };
});

// Capture sent emails
let mockSentEmails = [];
jest.mock("../src/utils/email", () => ({
    sendOtpEmail: jest.fn(async (email, otp) => {
        mockSentEmails.push({ email, otp });
        return true;
    })
}));

// In-memory User database
const mockDbUsers = new Map();

jest.mock("../src/models/User", () => ({
    findOne: jest.fn(async (query) => {
        if (query.email) {
            const email = query.email.toLowerCase().trim();
            for (const user of mockDbUsers.values()) {
                if (user.email.toLowerCase().trim() === email) {
                    return user;
                }
            }
        }
        return null;
    }),
    findById: jest.fn(async (id) => mockDbUsers.get(id) || null),
    create: jest.fn(async (doc) => {
        const id = "user_" + Math.random().toString(36).substr(2, 9);
        const user = { _id: id, ...doc };
        mockDbUsers.set(id, user);
        return user;
    }),
    findByIdAndUpdate: jest.fn(async (id, update) => {
        const user = mockDbUsers.get(id);
        if (user) {
            Object.assign(user, update);
            return user;
        }
        return null;
    })
}));

const app = require("../app");
const { hashValue } = require("../src/utils/otp");

describe("MASTER AUDIT: Complete OTP & Password Reset Flow", () => {
    let testUser;
    const testEmail = "audit.user@example.com";
    const initialPassword = "OldPassword123!";
    const newPassword = "NewPassword1234!";

    beforeAll(async () => {
        const hashedPassword = await bcrypt.hash(initialPassword, 10);
        testUser = {
            _id: "user_audit_1001",
            name: "Audit User",
            email: testEmail,
            password: hashedPassword
        };
        mockDbUsers.set(testUser._id, testUser);
    });

    beforeEach(() => {
        mockSentEmails = [];
    });

    test("Phase 2 & 10: Forgot password with existing user generates OTP and delivers email", async () => {
        const res = await request(app)
            .post("/auth/forgot-password")
            .send({ email: testEmail });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("an OTP has been sent");
        expect(mockSentEmails.length).toBe(1);
        expect(mockSentEmails[0].email).toBe(testEmail);
        expect(mockSentEmails[0].otp).toMatch(/^\d{6}$/); // Exactly 6 digits
        expect(res.body.otp).toBeUndefined(); // Plaintext OTP never exposed to client
    });

    test("Phase 10: Generic response for non-existing email (Account enumeration prevention)", async () => {
        const res = await request(app)
            .post("/auth/forgot-password")
            .send({ email: "nonexistent.user@example.com" });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("an OTP has been sent");
        expect(mockSentEmails.length).toBe(0); // No email sent
    });

    test("Phase 8: Resend OTP cooldown (60s rate limit)", async () => {
        // First request sent an OTP and set 60s cooldown
        const res = await request(app)
            .post("/auth/forgot-password")
            .send({ email: testEmail });

        expect(res.status).toBe(200);
        expect(mockSentEmails.length).toBe(0); // Blocked by cooldown, returns generic response
    });

    test("Phase 4: Redis storage verification (Stored hashed, not plaintext)", async () => {
        const otpKey = `password-reset:otp:${testUser._id}`;
        const storedRaw = mockRedisStore.get(otpKey);
        expect(storedRaw).toBeDefined();

        const storedData = JSON.parse(storedRaw);
        expect(storedData.otpHash).toBeDefined();
        expect(storedData.attempts).toBe(0);
        // Ensure plaintext OTP is NOT in Redis
        expect(storedData.otp).toBeUndefined();
    });

    test("Phase 6: Wrong OTP handling & attempt tracking", async () => {
        const otpKey = `password-reset:otp:${testUser._id}`;
        const res = await request(app)
            .post("/auth/verify-otp")
            .send({ email: testEmail, otp: "999999" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid OTP.");

        const storedData = JSON.parse(mockRedisStore.get(otpKey));
        expect(storedData.attempts).toBe(1); // Attempt counter incremented
    });

    test("Phase 7: Max attempts enforcement (5 attempts)", async () => {
        const otpKey = `password-reset:otp:${testUser._id}`;
        
        // Attempt 2, 3, 4
        for (let i = 2; i <= 4; i++) {
            const res = await request(app)
                .post("/auth/verify-otp")
                .send({ email: testEmail, otp: "999999" });
            expect(res.status).toBe(400);
        }

        // Attempt 5
        const res5 = await request(app)
            .post("/auth/verify-otp")
            .send({ email: testEmail, otp: "999999" });
        expect(res5.status).toBe(400);

        // Attempt 6: Max attempts reached, OTP deleted
        const res6 = await request(app)
            .post("/auth/verify-otp")
            .send({ email: testEmail, otp: "999999" });
        expect(res6.status).toBe(400);
        expect(mockRedisStore.has(otpKey)).toBe(false); // Key deleted
    });

    test("Phase 5: Expired OTP rejection", async () => {
        // Clear cooldown and generate a new OTP
        mockRedisStore.delete(`password-reset:cooldown:${testUser._id}`);
        await request(app).post("/auth/forgot-password").send({ email: testEmail });
        
        const latestOtp = mockSentEmails[0].otp;
        const otpKey = `password-reset:otp:${testUser._id}`;

        // Simulate TTL expiration
        mockRedisExpiry.set(otpKey, Date.now() - 1000);

        const res = await request(app)
            .post("/auth/verify-otp")
            .send({ email: testEmail, otp: latestOtp });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain("expired or is invalid");
    });

    test("Phase 3, 11: Correct OTP verification generates single-use reset token", async () => {
        // Clear cooldown and generate fresh OTP
        mockRedisStore.delete(`password-reset:cooldown:${testUser._id}`);
        await request(app).post("/auth/forgot-password").send({ email: testEmail });
        
        const latestOtp = mockSentEmails[0].otp;
        const otpKey = `password-reset:otp:${testUser._id}`;

        const res = await request(app)
            .post("/auth/verify-otp")
            .send({ email: testEmail, otp: latestOtp });

        expect(res.status).toBe(200);
        expect(res.body.resetToken).toBeDefined();
        expect(res.body.resetToken.length).toBe(64); // 32 random bytes hex
        expect(mockRedisStore.has(otpKey)).toBe(false); // OTP deleted immediately

        // Verify reset token stored as hash in Redis
        const resetTokenHash = hashValue(res.body.resetToken);
        const resetKey = `password-reset:token:${resetTokenHash}`;
        expect(mockRedisStore.get(resetKey)).toBe(testUser._id);

        global.auditResetToken = res.body.resetToken;
    });

    test("Phase 12: Password reset with valid token updates password", async () => {
        const res = await request(app)
            .post("/auth/reset-password")
            .send({
                resetToken: global.auditResetToken,
                newPassword: newPassword
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Password reset successfully.");

        // Reset token must be deleted (Single use)
        const resetTokenHash = hashValue(global.auditResetToken);
        const resetKey = `password-reset:token:${resetTokenHash}`;
        expect(mockRedisStore.has(resetKey)).toBe(false);
    });

    test("Phase 11: Reset token reuse is rejected", async () => {
        const res = await request(app)
            .post("/auth/reset-password")
            .send({
                resetToken: global.auditResetToken,
                newPassword: "AnotherPassword123!"
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain("invalid or expired");
    });

    test("Phase 12: Login with new password succeeds and old password fails", async () => {
        // Old password must fail
        const oldLoginRes = await request(app)
            .post("/auth/login")
            .send({ email: testEmail, password: initialPassword });
        expect(oldLoginRes.status).toBe(400);
        expect(oldLoginRes.body.message).toBe("Invalid credentials");

        // New password must succeed
        const newLoginRes = await request(app)
            .post("/auth/login")
            .send({ email: testEmail, password: newPassword });
        expect(newLoginRes.status).toBe(200);
        expect(newLoginRes.body.token).toBeDefined();
    });
});
