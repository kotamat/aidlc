import type { DomainEvent } from "./DomainEvent";

type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

export class EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);
  }

  unsubscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    this.handlers.get(eventType)?.delete(handler as EventHandler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const targets = this.handlers.get(event.type);
    if (!targets) return;
    for (const handler of targets) {
      await handler(event);
    }
  }
}
