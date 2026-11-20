"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const eventEngine_1 = require("../src/events/eventEngine");
(0, vitest_1.describe)("InsureFlow Event-Driven Engine", () => {
    (0, vitest_1.it)("enqueues and dispatches events in FIFO order", async () => {
        const queue = new eventEngine_1.EventQueue();
        const dispatcher = new eventEngine_1.EventDispatcher(queue);
        const processedOrder = [];
        dispatcher.register("claim_submitted", (evt) => {
            processedOrder.push(evt.payload.claimId);
        });
        dispatcher.publish("claim_submitted", { claimId: "CLM-1" });
        dispatcher.publish("claim_submitted", { claimId: "CLM-2" });
        await new Promise((r) => setTimeout(r, 20));
        (0, vitest_1.expect)(processedOrder).toEqual(["CLM-1", "CLM-2"]);
        (0, vitest_1.expect)(queue.size()).toBe(0);
    });
    (0, vitest_1.it)("captures handler errors without crashing the dispatcher", async () => {
        const queue = new eventEngine_1.EventQueue();
        const dispatcher = new eventEngine_1.EventDispatcher(queue);
        dispatcher.register("claim_submitted", () => {
            throw new Error("Simulated handler failure");
        });
        const evt = dispatcher.publish("claim_submitted", { claimId: "CLM-ERR" });
        await new Promise((r) => setTimeout(r, 20));
        (0, vitest_1.expect)(evt.status).toBe("failed");
        (0, vitest_1.expect)(evt.error).toBe("Simulated handler failure");
    });
});
//# sourceMappingURL=eventEngine.test.js.map