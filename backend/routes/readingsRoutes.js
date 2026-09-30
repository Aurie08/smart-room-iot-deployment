const express = require("express");

const router = express.Router();

const {
    createReading
} = require("../controllers/readingsController");

const authenticateToken = require("../middleware/authMiddleware");

router.post("/", authenticateToken, createReading);

module.exports = router;