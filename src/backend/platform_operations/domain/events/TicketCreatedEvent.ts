import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface TicketCreatedPayload {
  ticketId: string;
  category: string;
}

export class TicketCreatedEvent implements DomainEvent {
  readonly type = "operations.ticket.created";
  readonly occurredAt: Date;

  constructor(readonly payload: TicketCreatedPayload) {
    this.occurredAt = new Date();
  }
}
