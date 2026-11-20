# InsureFlow System Architecture

## Event-Driven Pipeline
InsureFlow decouples user actions (Producers) from business side-effects (Handlers) using an in-memory FIFO Event Queue and Event Dispatcher.

```mermaid
flowchart LR
    P[Event Producers] --> Q[In-Memory Event Queue]
    Q --> D[Event Dispatcher]
    D --> H1[Policy & Risk Handlers]
    D --> H2[Status & Adjuster Handlers]
    D --> H3[Payment & Notification Handlers]
    H1 --> DB[JSON Persistence & Event Log]
    H2 --> DB
    H3 --> DB
```

## Component Responsibilities
1. Event Producers: UI actions and REST endpoints publish immutable event objects rather than mutating downstream states directly.
2. Event Queue: Buffers incoming events with unique EVT-XXXXXXXX identifiers and ISO-8601 timestamps.
3. Event Dispatcher: Dequeues events sequentially, invokes all registered subscribers for that EventName, handles exceptions safely, and writes the final status to the Event Log.
4. Independent Event Handlers: Single-responsibility functions that react to events and emit secondary cascading events.
