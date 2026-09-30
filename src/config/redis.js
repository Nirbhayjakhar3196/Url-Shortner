
const { createClient } = require("redis");

const rawRedisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

rawRedisClient.on("error", (error) => {
    // Suppress unhandled crash logs when offline
});

const inMemoryStore = new Map();
const inMemoryExpiry = new Map();

const isKeyExpired = (key) => {
    if (inMemoryExpiry.has(key) && Date.now() > inMemoryExpiry.get(key)) {
        inMemoryStore.delete(key);
        inMemoryExpiry.delete(key);
        return true;
    }
    return false;
};

const redisClient = {
    get isOpen() {
        return rawRedisClient.isOpen;
    },
    async set(key, value, options = {}) {
        if (rawRedisClient.isOpen) {
            return rawRedisClient.set(key, value, options);
        }
        inMemoryStore.set(key, String(value));
        if (options && options.EX) {
            inMemoryExpiry.set(key, Date.now() + options.EX * 1000);
        } else if (!options || !options.KEEPTTL) {
            inMemoryExpiry.delete(key);
        }
        return "OK";
    },
    async get(key) {
        if (rawRedisClient.isOpen) {
            return rawRedisClient.get(key);
        }
        if (isKeyExpired(key)) return null;
        return inMemoryStore.get(key) || null;
    },
    async getDel(key) {
        if (rawRedisClient.isOpen) {
            return rawRedisClient.getDel(key);
        }
        if (isKeyExpired(key)) return null;
        const val = inMemoryStore.get(key) || null;
        inMemoryStore.delete(key);
        inMemoryExpiry.delete(key);
        return val;
    },
    async del(key) {
        if (rawRedisClient.isOpen) {
            return rawRedisClient.del(key);
        }
        isKeyExpired(key);
        const existed = inMemoryStore.delete(key);
        inMemoryExpiry.delete(key);
        return existed ? 1 : 0;
    },
    async exists(key) {
        if (rawRedisClient.isOpen) {
            return rawRedisClient.exists(key);
        }
        if (isKeyExpired(key)) return 0;
        return inMemoryStore.has(key) ? 1 : 0;
    },
    async eval(script, options = {}) {
        if (rawRedisClient.isOpen) {
            return rawRedisClient.eval(script, options);
        }
        return [1, 10, 0];
    },
    on(event, listener) {
        return rawRedisClient.on(event, listener);
    },
    async connect() {
        return rawRedisClient.connect();
    }
};

const connectRedis = async () => {
    try {
        await rawRedisClient.connect();
        console.log("Redis connected successfully");
    } catch (error) {
        console.log("Remote Redis unreachable locally; in-memory store activated for local server.");
    }
};

module.exports = {
    redisClient,
    connectRedis
};