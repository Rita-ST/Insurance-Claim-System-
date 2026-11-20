const int PIN_BTN_NEW    = 14;
const int PIN_BTN_STATUS = 27;
const int PIN_BTN_CANCEL = 26;
const int PIN_BTN_FAST   = 25;
const int PIN_LED_SENT   = 2;

volatile int pendingAction = 0; // 1=new, 2=status, 3=cancel, 4=fast
volatile unsigned long lastIsrMs = 0;
int ticketSeq = 100;

void IRAM_ATTR isrNew()    { if (millis() - lastIsrMs > 300) { pendingAction = 1; lastIsrMs = millis(); } }
void IRAM_ATTR isrStatus() { if (millis() - lastIsrMs > 300) { pendingAction = 2; lastIsrMs = millis(); } }
void IRAM_ATTR isrCancel() { if (millis() - lastIsrMs > 300) { pendingAction = 3; lastIsrMs = millis(); } }
void IRAM_ATTR isrFast()   { if (millis() - lastIsrMs > 300) { pendingAction = 4; lastIsrMs = millis(); } }

void emitRequest(const char* requestType, const char* priority) {
  ticketSeq++;
  digitalWrite(PIN_LED_SENT, HIGH);

  Serial.printf(
    "{\"event\":\"kiosk.request.created\",\"kioskId\":\"branch-desk-01\",\"ticket\":\"T-%d\",\"requestType\":\"%s\",\"priority\":\"%s\"}\n",
    ticketSeq, requestType, priority
  );

  delay(250);
  digitalWrite(PIN_LED_SENT, LOW);
}

void setup() {
  Serial.begin(115200);

  pinMode(PIN_BTN_NEW, INPUT_PULLUP);
  pinMode(PIN_BTN_STATUS, INPUT_PULLUP);
  pinMode(PIN_BTN_CANCEL, INPUT_PULLUP);
  pinMode(PIN_BTN_FAST, INPUT_PULLUP);
  pinMode(PIN_LED_SENT, OUTPUT);

  attachInterrupt(digitalPinToInterrupt(PIN_BTN_NEW), isrNew, FALLING);
  attachInterrupt(digitalPinToInterrupt(PIN_BTN_STATUS), isrStatus, FALLING);
  attachInterrupt(digitalPinToInterrupt(PIN_BTN_CANCEL), isrCancel, FALLING);
  attachInterrupt(digitalPinToInterrupt(PIN_BTN_FAST), isrFast, FALLING);

  Serial.println("Branch Kiosk Producer ready: press NEW CLAIM, STATUS, CANCEL, or FAST TELLER.");
}

void loop() {
  if (pendingAction != 0) {
    int action = pendingAction;
    pendingAction = 0;

    if (action == 1) emitRequest("new_claim", "normal");
    if (action == 2) emitRequest("check_status", "normal");
    if (action == 3) emitRequest("cancel_claim", "normal");
    if (action == 4) emitRequest("fast_teller_help", "urgent");
  }
  delay(10);
}
