const express = require("express");

const {createShortUrl , getAnalytics , redirectUrl , getUrls , deleteUrl} = require("../controllers/urlController")

const protect = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimit");

const router = express.Router();

const createUrlRateLimit = rateLimit({
    capacity: 20,
    refillRate: 20 / 60,
    keyPrefix: "create-url",
    getIdentifier: (req) => req.user?.id || req.ip
});

router.post("/", protect, createUrlRateLimit, createShortUrl);

router.get("/analytics/:shortId", protect, getAnalytics);


router.get("/my", protect, getUrls);

router.delete("/:shortId", protect, deleteUrl);

module.exports = router;
