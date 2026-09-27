const crypto = require('crypto')

const generateOtp = () => {

    return crypto.randomInt(100000, 1000000).toString();

}

const hashValue = (value) => {

    return crypto
        .createHash("sha256")
        .update(value)
        .digest("hex")
}

module.exports = {
    generateOtp, hashValue
}