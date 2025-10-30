import { SupportTicketRepository } from "../domain/repositories/SupportTicketRepository";
import { SupportTicket, TicketStatus } from "../domain/aggregates/SupportTicket";
import type { EventBus } from "../../shared/events/EventBus";

export class TicketRoutingAppService {
  constructor(
    private readonly tickets: SupportTicketRepository,
    private readonly eventBus: EventBus,
  ) {}

  create(ticketId: string, category: string, priority: "LOW" | "HIGH"): SupportTicket {
    const ticket = new SupportTicket(ticketId, category, priority);
    this.tickets.save(ticket);
    this.eventBus.publish(ticket.createEvent());
    return ticket;
  }

  updateStatus(ticketId: string, status: TicketStatus): void {
    const ticket = this.tickets.findById(ticketId);
    if (!ticket) throw new Error("ticket not found");
    ticket.updateStatus(status);
    this.tickets.save(ticket);
  }

  list() {
    return this.tickets.list().map((ticket) => ticket.snapshot());
  }
}
