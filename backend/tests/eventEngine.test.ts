import { describe, it, expect } from "vitest";
import { EventQueue, EventDispatcher } from "../src/events/eventEngine";

describe("InsureFlow Event-Driven Engine", () => {
  it("enqueues and dispatches events in FIFO order", async () => {
    const queue = new EventQueue();
    const dispatcher = new EventDispatcher(queue);
    const processedOrder: string[] = [];

    dispatcher.register("claim_submitted", (evt) => {
      processedOrder.push(evt.payload.claimId);
    });

    dispatcher.publish("claim_submitted", { claimId: "CLM-1" });
    dispatcher.publish("claim_submitted", { claimId: "CLM-2" });

    await new Promise((r) => setTimeout(r, 20));

    expect(processedOrder).toEqual(["CLM-1", "CLM-2"]);
    expect(queue.size()).toBe(0);
  });

  it("captures handler errors without crashing the dispatcher", async () => {
    const queue = new EventQueue();
    const dispatcher = new EventDispatcher(queue);

    dispatcher.register("claim_submitted", () => {
      throw new Error("Simulated handler failure");
    });

    const evt = dispatcher.publish("claim_submitted", { claimId: "CLM-ERR" });
    await new Promise((r) => setTimeout(r, 20));

    expect(evt.status).toBe("failed");
    expect(evt.error).toBe("Simulated handler failure");
  });
});
