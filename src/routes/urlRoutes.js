const express = require("express");

const {createShortUrl , getAnalytics , redirectUrl , getUrls , deleteUrl} = require("../controllers/urlController")

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/" ,protect ,  createShortUrl);

router.get("/analytics/:shortId",protect, getAnalytics);


router.get("/my", protect , getUrls);

router.delete("/:shortId", protect, deleteUrl);

module.exports = router;
