const { redisClient } = require("../config/redis");

const tokenBucketScript = `
local key = KEYS[1]

local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local data = redis.call("HMGET", key, "tokens", "lastRefill")

local tokens = tonumber(data[1])
local lastRefill = tonumber(data[2])

if tokens == nil then
    tokens = capacity
    lastRefill = now
end

local elapsed = math.max(0, now - lastRefill)

tokens = math.min(
    capacity,
    tokens + (elapsed * refillRate)
)

local allowed = 0
local retryAfter = 0

if tokens >= 1 then
    tokens = tokens - 1
    allowed = 1
else
    retryAfter = math.ceil((1 - tokens) / refillRate)
end

redis.call(
    "HSET",
    key,
    "tokens",
    tokens,
    "lastRefill",
    now
)

redis.call(
    "EXPIRE",
    key,
    math.ceil(capacity / refillRate) * 2
)

return {
    allowed,
    tokens,
    retryAfter
}
`;

const rateLimit = ({
    capacity,
    refillRate,
    keyPrefix,
    getIdentifier = (req) => req.ip
}) => {
    return async (req, res, next) => {
        try {
            const identifier = getIdentifier(req);

            console.log(
                "RATE LIMIT HIT:",
                keyPrefix,
                identifier
            );

            const key =
                `rate-limit:${keyPrefix}:${identifier}`;

            const now = Math.floor(Date.now() / 1000);;

            const result = await redisClient.eval(
                tokenBucketScript,
                {
                    keys: [key],
                    arguments: [
                        capacity.toString(),
                        refillRate.toString(),
                        now.toString()
                    ]
                }
            );

            const allowed = Number(result[0]);
            const retryAfter = Number(result[2]);

            if (allowed === 0) {
                res.set(
                    "Retry-After",
                    retryAfter.toString()
                );

                return res.status(429).json({
                    message:
                        "Too many requests. Please try again later."
                });
            }

            next();

        } catch (error) {
            console.log(
                "Rate limiter error:",
                error
            );

            next();
        }
    };
};

module.exports = rateLimit;