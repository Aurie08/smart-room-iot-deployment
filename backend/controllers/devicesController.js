const db = require("../config/firebase");

const createDevice = async (req, res) => {
    try {
        const {
            device_id,
            name,
            location
        } = req.body;

        if (!device_id || !name || !location) {
            return res.status(400).json({
                success: false,
                message: "device_id, name and location are required"
            });
        }

        const deviceRef = db.collection("devices").doc(device_id);
        const existingDevice = await deviceRef.get();

        if (existingDevice.exists) {
            return res.status(409).json({
                success: false,
                message: "Device already exists"
            });
        }

        const device = {
            device_id,
            name,
            location,
            status: "offline",
            created_at: new Date()
        };

        await deviceRef.set(device);

        res.status(201).json({
            success: true,
            message: "Device created successfully",
            data: device
        });

    } catch (error) {
        console.error("Create device error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create device"
        });
    }
};


const getDevices = async (req, res) => {
    try {
        const snapshot = await db
            .collection("devices")
            .orderBy("created_at", "desc")
            .get();

        const devices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({
            success: true,
            count: devices.length,
            data: devices
        });

    } catch (error) {
        console.error("Get devices error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve devices"
        });
    }
};


module.exports = {
    createDevice,
    getDevices
};