const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
console.log("🔌 Paste Wokwi Serial Monitor JSON lines below (or pipe RFC2217 output):");
rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{")) return;
  try {
    const data = JSON.parse(trimmed);
    const res = await fetch("http://localhost:4000/api/kiosk-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    console.log("➡️ Forwarded to InsureFlow:", data.ticket, data.requestType, "-> HTTP", res.status);
  } catch (e) {
    console.error("Invalid JSON line:", e.message);
  }
});
