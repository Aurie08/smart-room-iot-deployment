const express = require("express");

const router = express.Router();

const {
    createReading,
    getReadings,
    getReadingsByDevice
} = require("../controllers/readingsController");

const authenticateToken = require("../middleware/authMiddleware");
const authenticateDevice = require("../middleware/deviceAuthMiddleware");

// ESP32 sends sensor readings using the device API key
router.post("/", authenticateDevice, createReading);

// Dashboard/users use JWT authentication
router.get("/", authenticateToken, getReadings);
router.get("/:device_id", authenticateToken, getReadingsByDevice);

module.exports = router;