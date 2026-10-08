const authenticateDevice = (req, res, next) => {
    try {
        const apiKey = req.headers["x-api-key"];

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: "Device API key required"
            });
        }

        if (apiKey !== process.env.DEVICE_API_KEY) {
            return res.status(403).json({
                success: false,
                message: "Invalid device API key"
            });
        }

        next();

    } catch (error) {
        console.error("Device authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Device authentication failed"
        });
    }
};

module.exports = authenticateDevice;