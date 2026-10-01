const express = require("express");

const router = express.Router();

const {
    createDevice,
    getDevices
} = require("../controllers/devicesController");

const authenticateToken = require("../middleware/authMiddleware");

router.post("/", authenticateToken, createDevice);

router.get("/", authenticateToken, getDevices);

module.exports = router;