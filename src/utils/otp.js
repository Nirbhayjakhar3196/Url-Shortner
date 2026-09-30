const crypto = require("crypto");

const generateOtp = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

const hashValue = (value) => {
    return crypto
        .createHash("sha256")
        .update(String(value))
        .digest("hex");
};

const generateResetToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

module.exports = {
    generateOtp,
    hashValue,
    generateResetToken
};

