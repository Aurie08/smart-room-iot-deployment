const express = require("express");

const router = express.Router();

const {
    createReading,
    getReadings,
    getReadingsByDevice
} = require("../controllers/readingsController");

const authenticateToken = require("../middleware/authMiddleware");

router.post("/", authenticateToken, createReading);
router.get("/", authenticateToken, getReadings);
router.get("/:device_id", authenticateToken, getReadingsByDevice);

module.exports = router;