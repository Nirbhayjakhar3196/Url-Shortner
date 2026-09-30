const crypto = require('crypto')

const generateOtp = () => {

    return crypto.randomInt(100000, 1000000).toString();

}

const hashValue = (value) => {

    const clean = String(value ?? '').trim();

    return crypto
        .createHash("sha256")
        .update(clean)
        .digest("hex")
}

module.exports = {
    generateOtp, hashValue
}