#define LDR_PIN 0

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
}

void loop() {
  int ldrRaw = analogRead(LDR_PIN);
  Serial.printf("✅ LDR Light Raw ADC Value: %d\n", ldrRaw);
  delay(1000);
}
