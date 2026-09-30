const express = require("express");

const router = express.Router();

const {
    createReading,
    getReadings
} = require("../controllers/readingsController");

const authenticateToken = require("../middleware/authMiddleware");

router.post("/", authenticateToken, createReading);
router.get("/", authenticateToken, getReadings);

module.exports = router;