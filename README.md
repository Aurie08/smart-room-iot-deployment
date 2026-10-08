# Smart Room IoT Data Management System

A complete IoT data pipeline built for the *Internet and Web Systems* module assignment. The system collects sensor readings from an ESP32-based device, sends them through a secured Node.js + Express backend, stores them in Firebase Firestore, and displays them on a responsive web dashboard with live Chart.js visualizations.

**Module:** Internet and Web Systems — Assignment 2026
**Team:** Ben Chapuma, Olinda, Tamanda
**Submission tag:** `final-submission`
**Demo date:** 9th October 2026

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Team Roles](#team-roles)
4. [Repository Structure](#repository-structure)
5. [Tech Stack](#tech-stack)
6. [Setup Instructions](#setup-instructions)
7. [Environment Variables](#environment-variables)
8. [Running the System](#running-the-system)
9. [API Endpoints](#api-endpoints)
10. [Sensor Data Format](#sensor-data-format)
11. [Frontend Features](#frontend-features)
12. [Resilience](#resilience)
13. [Git Workflow](#git-workflow)
14. [Acknowledgements](#acknowledgements)

---

## System Overview

The Smart Room IoT Data Management System monitors four environmental sensors inside a room:

| Sensor | Field | Unit | Purpose |
|--------|-------|------|---------|
| Temperature | `temperature` | °C | Ambient temperature |
| Humidity | `humidity` | % | Relative humidity |
| Light | `light` | raw level | Ambient light level |
| Gas / Smoke (MQ-2) | `gas_level` | raw level | Gas/smoke detection |

Readings are transmitted as JSON over HTTP from the IoT device, stored in Firebase Firestore, and served to the dashboard through a JWT-protected REST API.

---

## Architecture

┌─────────────────┐ JSON ┌──────────────────┐ SDK ┌──────────────────┐
│ ESP32 + 4 │ ──────────▶ │ Node.js + │ ──────────▶ │ Firebase │
│ Sensors │ HTTP POST │ Express Backend │ │ Firestore │
│ (Tamanda) │ │ (Olinda) │ │ │
└─────────────────┘ └────────┬─────────┘ └──────────────────┘
│
│ REST + JWT
▼
┌──────────────────┐
│ Frontend │
│ Dashboard │
│ EJS + jQuery + │
│ Chart.js │
│ (Ben) │
└──────────────────┘

**Data flow:**

1. ESP32 device reads the four sensors and POSTs a JSON payload to `/api/readings`.
2. Express validates the request and writes the reading to Firebase Firestore.
3. The dashboard calls `GET /api/readings` on a 10-second interval with a Bearer token.
4. Express returns the latest readings from Firestore, which are rendered as sensor cards and line charts.

---

## Team Roles

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Ben Chapuma** | Frontend Developer | Login page, dashboard UI, sensor cards, Chart.js integration, responsive CSS, frontend JavaScript, loading/empty/error states |
| **Olinda** | Backend Developer | Express server, Firebase Firestore integration, JWT authentication, REST API routes, backend middleware |
| **Tamanda** | IoT Hardware & QA | ESP32 hardware setup, sensor wiring (temperature, humidity, light, MQ-2 gas), device-side JSON transmission, testing and validation |

---

## Repository Structure
internet-and-web-services-iot-dashboard-design-group-2/
├── backend/
│ ├── config/
│ │ └── firebase.js # Firebase initialization
│ ├── controllers/ # Route handler logic
│ ├── middleware/
│ │ └── authMiddleware.js # JWT verification middleware
│ ├── routes/
│ │ ├── authRoutes.js # /api/auth/*
│ │ ├── readingsRoutes.js # /api/readings/*
│ │ └── devicesRoutes.js # /api/devices/*
│ ├── public/
│ │ ├── css/
│ │ │ └── style.css # Dashboard + login styles (responsive)
│ │ └── js/
│ │ ├── login.js # Login form handling + JWT storage
│ │ └── dashboard.js # Live data polling + Chart.js rendering
│ ├── views/
│ │ ├── login.ejs # Login page template
│ │ └── dashboard.ejs # Dashboard template
│ ├── package.json
│ ├── package-lock.json
│ └── server.js # Express entry point
├── .gitignore
├── package.json
├── package-lock.json
└── README.md


---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| IoT Device | ESP32 (Arduino framework) |
| Sensors | DHT22 (temperature + humidity), LDR (light), MQ-2 (gas/smoke) |
| Backend | Node.js, Express.js |
| View Engine | EJS |
| Database | Firebase Firestore |
| Auth | JWT (JSON Web Tokens) |
| Frontend | HTML5, CSS3, jQuery, Chart.js |
| Version Control | Git + GitHub |

---

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Git
- A Firebase project with Firestore enabled (for backend)
- ESP32 with Arduino IDE (for hardware)

### 1. Clone the repository

```bash
git clone https://github.com/Student-Work-Classroom-Demo-MUBAS/internet-and-web-services-iot-dashboard-design-group-2.git
cd internet-and-web-services-iot-dashboard-design-group-2

```
### 2. Install backend dependencies
```bash
cd backend
npm install
```
### 3. Configure Firebase credentials
The backend uses a Firebase service account key. This file is intentionally excluded from Git (see .gitignore) because it contains secrets.

Obtain serviceAccountKey.json from the Firebase Console (Project Settings → Service Accounts → Generate New Private Key).

Place it at: backend/config/serviceAccountKey.json.

If this file is missing, the server still boots in stub mode and Firebase-dependent routes will return errors — useful for frontend development without needing the key.

### 4. Configure environment variables
Create a .env file at the repository root (not inside backend/):
```bash
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
FIREBASE_PROJECT_ID=your_firebase_project_id
```
## Environment Variables
Variable | Purpose |	Example
JWT_SECRET	Secret used to sign and verify JWT tokens	super-secret-string
JWT_EXPIRES_IN	Token lifetime	1h
FIREBASE_PROJECT_ID	Firebase project identifier	smart-room-iot-xxxxx

## Running the System
Start the backend + frontend
```bash
cd backend
node server.js
```
You should see:
```bash
✅ Firebase initialized from serviceAccountKey.json
Server running on http://localhost:5000
```
Or, if the service account key is missing:
```bash
⚠️  serviceAccountKey.json not found — running Firebase in stub mode
Server running on http://localhost:5000
```
## Access the dashboard
Open a browser and visit:
```bash
Login: http://localhost:5000/login

Dashboard: http://localhost:5000/dashboard (requires login)
```
