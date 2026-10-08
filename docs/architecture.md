# System Architecture
**Project:** Smart Room IoT Data Management System   
**Team Members:** Olinda Vashi (Backend), Ben Chapuma (Frontend), Tamanda Kamoto (Hardware & Documentation)  

---

## 1. System Overview

The **Smart Room IoT Data Management System** captures real-time indoor environmental telemetry via physical sensors connected to an ESP32-C3 microcontroller node. The node formats sensor metrics into a standardized JSON payload and transmits them over HTTP POST requests to a REST API. The backend validates, stores, and syncs data to Firebase, where a web dashboard displays real-time room analytics and environmental alerts.

---

## 2. Hardware Architecture

The system utilizes an **ESP32-C3** development board where all sensors operate on standard 3.3V/5V power lines sharing a common ground with the ESP32-C3.

### ESP32-C3 Hardware Pinout 

| Sensor / Module | Physical Function | Signal Type | ESP32-C3 GPIO Pin | ADC Channel | Operating Threshold / Range |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DHT22 (AM2302)** | Temperature & Humidity | Digital | `GPIO 4` | N/A (Digital I/O) | Temp: $18.0\text{–}28.0\text{ }^\circ\text{C}$ \| Hum: $30.0\text{–}60.0\%$ |
| **LDR Module** | Light Level Sensor | Analog | `GPIO 0` | ADC1 Channel 0 | Raw ADC: $300\text{–}3000$ ($0\text{–}4095$ range) |
| **MQ-2 Sensor** | Gas & Smoke Level | Analog | `GPIO 1` | ADC1 Channel 1 | Raw ADC Baseline $<400$ ($0\text{–}4095$ range) |
| **Power Line** | Sensor Operating VCC | Power | `3.3V` / `5V` | N/A | Voltage line shared across sensors |
| **Ground Line** | Common System Ground | Ground | `GND` | N/A | Common ground reference |

> **Note on LDR & MQ-2 Sensor Readings:** The readings are treated as raw ADC voltage levels as they were not calibrated.

---
