#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "secrets.h"

// =====================================================
// Wi-Fi & API Configuration
// =====================================================

const char* API_ENDPOINT =
    "https://smart-room-iot-deployment.onrender.com/api/readings";

// =====================================================
// Hardware Pins
// =====================================================

#define DHTPIN 4
#define DHTTYPE DHT22
#define LDR_PIN 0
#define MQ2_PIN 1

// =====================================================
// Objects
// =====================================================

DHT dht(DHTPIN, DHTTYPE);

const String DEVICE_ID = "ROOM-ESP32-01";

// =====================================================
// Timeouts
// =====================================================

const unsigned long WIFI_TIMEOUT = 20000;
const unsigned long HTTP_TIMEOUT = 10000;

// =====================================================
// Wi-Fi Connection Function
// =====================================================

bool connectToWiFi() {

  if (WiFi.status() == WL_CONNECTED) {
    return true;
  }

  Serial.println("\n⚠️ Wi-Fi disconnected.");
  Serial.println("Attempting to reconnect...");

  WiFi.disconnect();
  delay(500);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startTime = millis();

  while (WiFi.status() != WL_CONNECTED &&
         millis() - startTime < WIFI_TIMEOUT) {

    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println("\n✅ Wi-Fi Connected!");

    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");

    return true;

  } else {

    Serial.println("\n❌ Wi-Fi connection failed.");

    return false;
  }
}

// =====================================================
// Setup
// =====================================================

void setup() {

  Serial.begin(115200);

  delay(2000);

  Serial.println("\n========================================");
  Serial.println(" ESP32-C3 Smart Room IoT Node");
  Serial.println("========================================");

  // Initialize sensors
  dht.begin();

  analogReadResolution(12);

  // Configure Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(false);

  connectToWiFi();
}

// =====================================================
// Main Loop
// =====================================================

void loop() {

  // ---------------------------------------------------
  // 1. Check Wi-Fi
  // ---------------------------------------------------

  if (!connectToWiFi()) {

    Serial.println("⏳ Wi-Fi unavailable.");

    delay(5000);

    return;
  }

  // ---------------------------------------------------
  // 2. Read Sensors
  // ---------------------------------------------------

  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  int light = analogRead(LDR_PIN);
  int gas = analogRead(MQ2_PIN);

  // ---------------------------------------------------
  // 3. Validate DHT22
  // ---------------------------------------------------

  if (isnan(temp) || isnan(hum)) {

    Serial.println(
        "❌ Error: Invalid reading from DHT22!"
    );

    delay(5000);

    return;
  }

  // ---------------------------------------------------
  // 4. Build JSON Payload
  // ---------------------------------------------------

  JsonDocument doc;

  doc["device_id"] = DEVICE_ID;

  doc["temperature"] =
      round(temp * 10.0) / 10.0;

  doc["humidity"] =
      round(hum * 10.0) / 10.0;

  doc["light"] = light;

  doc["gas_level"] = gas;

  String jsonPayload;

  serializeJson(doc, jsonPayload);

  Serial.println("\n----------------------------------------");

  Serial.println("[Sensor Reading]");

  Serial.print("Temperature: ");
  Serial.print(temp);
  Serial.println(" °C");

  Serial.print("Humidity: ");
  Serial.print(hum);
  Serial.println(" %");

  Serial.print("Light: ");
  Serial.println(light);

  Serial.print("Gas: ");
  Serial.println(gas);

  Serial.println("\n[Payload]");
  Serial.println(jsonPayload);

  // ---------------------------------------------------
  // 5. Send to Render
  // ---------------------------------------------------

  bool sentSuccessfully = false;

  for (int attempt = 1; attempt <= 2; attempt++) {

    Serial.print("\n📡 Sending to Render - Attempt ");
    Serial.println(attempt);

    WiFiClientSecure client;

    // -------------------------------------------------
    // HTTPS
    // -------------------------------------------------
    // Render uses HTTPS.
    //
    // setInsecure() allows the ESP32 to establish the
    // encrypted HTTPS connection without storing a
    // certificate on the ESP32.
    //
    // The connection is still encrypted, but certificate
    // verification is disabled.
    // -------------------------------------------------

    client.setInsecure();

    HTTPClient http;

    http.setTimeout(HTTP_TIMEOUT);

    if (!http.begin(client, API_ENDPOINT)) {

      Serial.println(
          "❌ Failed to initialize HTTPS connection."
      );

      http.end();

      continue;
    }

    // Request headers
    http.addHeader(
        "Content-Type",
        "application/json"
    );

    http.addHeader(
        "X-API-Key",
        DEVICE_API_KEY
    );

    // Send POST request
    int httpResponseCode =
        http.POST(jsonPayload);

    // -------------------------------------------------
    // 6. Handle Response
    // -------------------------------------------------

    if (httpResponseCode > 0) {

      Serial.print(
          "✅ HTTP Response Code: "
      );

      Serial.println(httpResponseCode);

      String response =
          http.getString();

      Serial.println(
          "Server Response:"
      );

      Serial.println(response);

      if (httpResponseCode >= 200 &&
          httpResponseCode < 300) {

        sentSuccessfully = true;

        Serial.println(
            "✅ Reading successfully sent to Render!"
        );

      } else {

        Serial.println(
            "⚠️ Server returned an error."
        );
      }

    } else {

      Serial.print(
          "❌ HTTPS Error: "
      );

      Serial.println(
          http.errorToString(
              httpResponseCode
          )
      );
    }

    http.end();

    // Stop retrying if successful
    if (sentSuccessfully) {
      break;
    }

    // Retry after 2 seconds
    if (attempt < 2) {

      Serial.println(
          "⏳ Retrying in 2 seconds..."
      );

      delay(2000);
    }
  }

  // ---------------------------------------------------
  // 7. Final Status
  // ---------------------------------------------------

  if (!sentSuccessfully) {

    Serial.println(
        "❌ Failed to send reading after retries."
    );
  }

  // ---------------------------------------------------
  // 8. Wait 10 Seconds
  // ---------------------------------------------------

  Serial.println(
      "\n⏳ Waiting 10 seconds..."
  );

  delay(10000);
}