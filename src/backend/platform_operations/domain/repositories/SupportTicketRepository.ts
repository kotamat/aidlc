import { SupportTicket } from "../aggregates/SupportTicket";

export class SupportTicketRepository {
  private readonly store = new Map<string, SupportTicket>();

  save(ticket: SupportTicket): void {
    this.store.set(ticket.id, ticket);
  }

  findById(id: string): SupportTicket | undefined {
    return this.store.get(id);
  }

  list(): SupportTicket[] {
    return Array.from(this.store.values());
  }
}
