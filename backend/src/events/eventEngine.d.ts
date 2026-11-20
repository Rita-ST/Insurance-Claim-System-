import { DomainEvent, EventName } from './types';
type EventHandler = (event: DomainEvent) => Promise<void> | void;
export declare class EventQueue {
    private queue;
    enqueue(name: EventName, payload: Record<string, any>): DomainEvent;
    dequeue(): DomainEvent | undefined;
    size(): number;
}
export declare class EventDispatcher {
    private queue;
    private handlers;
    private isProcessing;
    constructor(queue: EventQueue);
    register(eventName: EventName, handler: EventHandler): void;
    publish(name: EventName, payload: Record<string, any>): DomainEvent;
    processNext(): Promise<void>;
}
export declare const eventQueue: EventQueue;
export declare const dispatcher: EventDispatcher;
export {};
//# sourceMappingURL=eventEngine.d.ts.map