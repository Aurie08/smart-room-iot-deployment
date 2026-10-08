#define MQ2_PIN 1

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
}

void loop() {
  int gasRaw = analogRead(MQ2_PIN);
  Serial.printf("✅ MQ-2 Raw Gas Level: %d\n", gasRaw);
  delay(1000);
}
