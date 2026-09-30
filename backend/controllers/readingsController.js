const db = require("../config/firebase");

const createReading = async (req, res) => {
    try {
        const {
            device_id,
            temperature,
            humidity,
            light,
            gas_level
        } = req.body;

        // Validate required fields
        if (
            !device_id ||
            temperature === undefined ||
            humidity === undefined ||
            light === undefined ||
            gas_level === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All sensor fields are required"
            });
        }

        // Create the reading object
        const reading = {
            device_id,
            temperature: Number(temperature),
            humidity: Number(humidity),
            light: Number(light),
            gas_level: Number(gas_level),
            recorded_at: new Date()
        };

        // Save reading to Firestore
        const docRef = await db.collection("readings").add(reading);

        res.status(201).json({
            success: true,
            message: "Sensor reading saved successfully",
            reading_id: docRef.id,
            data: reading
        });

    } catch (error) {
        console.error("Create reading error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save sensor reading"
        });
    }
};

module.exports = {
    createReading
};