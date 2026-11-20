const int PIN_BTN_CRASH = 14;
const int PIN_POT_IMPACT = 34;
const int PIN_LED_ALERT = 2;

volatile bool sosTriggered = false;
volatile unsigned long lastIsrMs = 0;

bool crashLatched = false;
int incidentSeq = 0;

// Simulated vehicle GPS coordinates (Warsaw)
const float GPS_LAT = 52.2297f;
const float GPS_LNG = 21.0122f;

void IRAM_ATTR onCrashButtonISR() {
  unsigned long now = millis();
  if (now - lastIsrMs > 300) {
    sosTriggered = true;
    lastIsrMs = now;
  }
}

void emitAccidentEvent(const char* triggerType, int impactPercent) {
  incidentSeq++;
  digitalWrite(PIN_LED_ALERT, HIGH);

  Serial.printf(
    "{\"event\":\"accident.detected\",\"vehicleId\":\"CAR-PL-409\",\"seq\":%d,\"trigger\":\"%s\",\"impactSeverity\":%d,\"lat\":%.4f,\"lng\":%.4f}\n",
    incidentSeq, triggerType, impactPercent, GPS_LAT, GPS_LNG
  );

  delay(350);
  digitalWrite(PIN_LED_ALERT, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BTN_CRASH, INPUT_PULLUP);
  pinMode(PIN_LED_ALERT, OUTPUT);

  attachInterrupt(digitalPinToInterrupt(PIN_BTN_CRASH), onCrashButtonISR, FALLING);

  Serial.println("Accident Sensor ready: slide G-Force pot >= 75% or press CRASH / SOS button.");
}

void loop() {
  int impactPercent = map(analogRead(PIN_POT_IMPACT), 0, 4095, 0, 100);

  // 1. Hardware interrupt trigger (manual SOS / airbag button)
  if (sosTriggered) {
    sosTriggered = false;
    emitAccidentEvent("manual_sos_button", impactPercent);
  }

  // 2. Impact threshold edge trigger (emits ONCE per crash event)
  if (impactPercent >= 75 && !crashLatched) {
    crashLatched = true;
    emitAccidentEvent("high_g_impact", impactPercent);
  } else if (impactPercent < 65) {
    crashLatched = false; // Reset latch after impact settles
  }

  delay(30);
}
