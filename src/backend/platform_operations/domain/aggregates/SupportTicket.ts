import { TicketCreatedEvent } from "../events/TicketCreatedEvent";

export type TicketStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export class SupportTicket {
  private status: TicketStatus = "NEW";
  private readonly timeline: { status: TicketStatus; occurredAt: Date }[] = [];

  constructor(public readonly id: string, private readonly category: string, private readonly priority: "LOW" | "HIGH") {
    this.timeline.push({ status: this.status, occurredAt: new Date() });
  }

  createEvent(): TicketCreatedEvent {
    return new TicketCreatedEvent({ ticketId: this.id, category: this.category });
  }

  updateStatus(status: TicketStatus): void {
    this.status = status;
    this.timeline.push({ status, occurredAt: new Date() });
  }

  snapshot() {
    return { id: this.id, category: this.category, priority: this.priority, status: this.status, timeline: [...this.timeline] };
  }
}
