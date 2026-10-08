#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "secrets.h"

// --- Wi-Fi & API Configuration ---

const char* API_ENDPOINT  = "http://10.36.227.243:5000/api/readings";

// --- Hardware Pins (ESP32-C3 Specific) ---
#define DHTPIN 4       // Digital Pin
#define DHTTYPE DHT22
#define LDR_PIN 0      // ADC1 Channel 0
#define MQ2_PIN 1      // ADC1 Channel 1

// --- Object Declarations ---
DHT dht(DHTPIN, DHTTYPE);
const String DEVICE_ID = "ROOM-ESP32-01"; // Standardized device ID

void setup() {
  Serial.begin(115200);
  delay(2000); // Wait for USB CDC initialization on ESP32-C3

  Serial.println("\n--- ESP32-C3 Smart Room IoT Node Starting ---");

  // Initialize Sensors
  dht.begin();
  analogReadResolution(12);

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  
  int retry_count = 0;
  while (WiFi.status() != WL_CONNECTED && retry_count < 20) {
    delay(500);
    Serial.print(".");
    retry_count++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Wi-Fi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n⚠️ Wi-Fi Connection Failed! Retrying in main loop.");
  }
}

void loop() {
  // Check Wi-Fi Connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ Wi-Fi offline. Reconnecting...");
    WiFi.reconnect();
    delay(5000);
    return;
  }

  // 1. Read Sensors
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();
  int light  = analogRead(LDR_PIN);
  int gas    = analogRead(MQ2_PIN);

  // Sensor Validation
  if (isnan(temp) || isnan(hum)) {
    Serial.println("❌ Error: Invalid reading from DHT22!");
    delay(5000);
    return;
  }

  // 2. Build Standard JSON Payload
  JsonDocument doc; // Supports ArduinoJson v7+
  doc["device_id"]   = DEVICE_ID;
  doc["temperature"] = round(temp * 10.0) / 10.0;
  doc["humidity"]    = round(hum * 10.0) / 10.0;
  doc["light"]       = light;
  doc["gas_level"]   = gas;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.println("\n[Payload Prepared]: " + jsonPayload);

  // 3. Transmit HTTP POST to Backend API
  HTTPClient http;
  http.begin(API_ENDPOINT);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", DEVICE_API_KEY);

  int httpResponseCode = http.POST(jsonPayload);

  // 4. Evaluate Response & Handle Errors
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("✅ HTTP Response Code: %d\n", httpResponseCode);
    Serial.println("Server Response Body: " + response);
  } else {
    Serial.printf("❌ HTTP Error Code: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end(); // Free network resources

  // Send reading every 10 seconds
  delay(10000);
}
