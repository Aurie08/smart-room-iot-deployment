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
// Convert sensor values to numbers
        const temperatureValue = Number(temperature);
        const humidityValue = Number(humidity);
        const lightValue = Number(light);
        const gasLevelValue = Number(gas_level);

        // Check that sensor values are valid numbers
        if (
            !Number.isFinite(temperatureValue) ||
            !Number.isFinite(humidityValue) ||
            !Number.isFinite(lightValue) ||
            !Number.isFinite(gasLevelValue)
        ) {
            return res.status(400).json({
                success: false,
                message: "Sensor values must be valid numbers"
            });
        }

        // Validate sensible sensor ranges
        if (temperatureValue < -40 || temperatureValue > 80) {
            return res.status(400).json({
                success: false,
                message: "Temperature value is outside the allowed range"
            });
        }

        if (humidityValue < 0 || humidityValue > 100) {
            return res.status(400).json({
                success: false,
                message: "Humidity must be between 0 and 100"
            });
        }

        if (lightValue < 0) {
            return res.status(400).json({
                success: false,
                message: "Light value cannot be negative"
            });
        }

        if (gasLevelValue < 0) {
            return res.status(400).json({
                success: false,
                message: "Gas level cannot be negative"
            });
        }

        // Make sure the device exists
        const deviceRef = db.collection("devices").doc(device_id);
        const deviceDoc = await deviceRef.get();

        if (!deviceDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Device not found"
            });
        }
         // Create validated reading
        const recordedAt = new Date();

const reading = {
    device_id,
    temperature: temperatureValue,
    humidity: humidityValue,
    light: lightValue,
    gas_level: gasLevelValue,
    recorded_at: recordedAt
};

const docRef = await db.collection("readings").add(reading);

// Update the device whenever a reading is received
await deviceRef.update({
    status: "online",
    last_seen: recordedAt.toISOString()
});

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

const getReadings = async (req, res) => {
    try {
        const snapshot = await db
            .collection("readings")
            .orderBy("recorded_at", "desc")
            .limit(50)
            .get();

        const readings = snapshot.docs.map(doc => {
    const data = doc.data();

    return {
        id: doc.id,
        ...data,
        recorded_at: data.recorded_at?.toDate
            ? data.recorded_at.toDate().toISOString()
            : data.recorded_at
    };
});

        res.json({
            success: true,
            count: readings.length,
            data: readings
        });

    } catch (error) {
        console.error("Get readings error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve sensor readings"
        });
    }
};

const getReadingsByDevice = async (req, res) => {
    try {
        const { device_id } = req.params;

        if (!device_id) {
            return res.status(400).json({
                success: false,
                message: "Device ID is required"
            });
        }

        const snapshot = await db
            .collection("readings")
            .where("device_id", "==", device_id)
            .limit(50)
            .get();

       const readings = snapshot.docs.map(doc => {
    const data = doc.data();

    return {
        id: doc.id,
        ...data,
        recorded_at: data.recorded_at?.toDate
            ? data.recorded_at.toDate().toISOString()
            : data.recorded_at
    };
});

        res.json({
            success: true,
            device_id,
            count: readings.length,
            data: readings
        });

    } catch (error) {
        console.error("Get device readings error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve device readings"
        });
    }
};

module.exports = {
    createReading,
    getReadings,
    getReadingsByDevice
};