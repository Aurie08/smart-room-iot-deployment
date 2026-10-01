# Smart Room IoT Data Management System
## REST API Documentation

**Project:** Smart Room IoT Data Management System  
**Course:** ELE-IWS-521 – Internet and Web Services  
**Backend:** Node.js + Express.js  
**Database:** Firebase Firestore  
**Authentication:** JSON Web Token (JWT)

---

## 1. API Overview

The Smart Room IoT Data Management System API is a RESTful backend developed using Node.js and Express.js.

The API provides communication between the ESP32-based IoT sensor node, Firebase Firestore database, and the web dashboard.

The API currently supports:

- User registration
- User login
- JWT authentication
- IoT device registration
- Device retrieval
- Sensor data submission
- Sensor data retrieval
- Device-specific sensor data retrieval
- Sensor data validation

### Backend Technologies

| Technology | Purpose |
|---|---|
| Node.js | Server-side runtime |
| Express.js | REST API framework |
| Firebase Firestore | Persistent database |
| Firebase Admin SDK | Server-side Firebase access |
| bcrypt | Password hashing |
| JSON Web Token (JWT) | Authentication |
| JavaScript | Backend implementation |

---

## 2. Base URL

During local development, the backend runs at:

```text
http://localhost:5000