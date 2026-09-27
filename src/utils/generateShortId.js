const crypto = require('crypto')

const generateShortId = () => {

    return crypto.randomBytes(5).toString("base64url").slice(0,7);

}

module.exports = generateShortId;