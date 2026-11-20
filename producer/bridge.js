const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
console.log("🔌 Universal ESP32 Serial Bridge Ready! Paste JSON lines from either Wokwi simulator:");
rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{")) return;
  try {
    const data = JSON.parse(trimmed);
    const route = data.event === "accident.detected" ? "/api/accident-events" : "/api/kiosk-events";
    const res = await fetch("http://localhost:4000" + route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    console.log("➡️ Routed", data.event, "->", route, "| HTTP", res.status);
  } catch (e) {
    console.error("Invalid JSON line:", e.message);
  }
});
