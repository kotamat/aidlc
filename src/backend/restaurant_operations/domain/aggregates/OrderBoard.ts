import { OrderAcknowledgedEvent } from "../events/OrderAcknowledgedEvent";
import { OrderReadyForPickupEvent } from "../events/OrderReadyForPickupEvent";

export type TicketStatus = "PENDING" | "ACKNOWLEDGED" | "PREPARING" | "READY_FOR_PICKUP" | "HANDED_OVER";

export interface OrderTicket {
  orderId: string;
  status: TicketStatus;
  receivedAt: Date;
}

export class OrderBoard {
  private readonly tickets = new Map<string, OrderTicket>();

  constructor(public readonly restaurantId: string) {}

  accept(orderId: string): OrderAcknowledgedEvent {
    this.tickets.set(orderId, { orderId, status: "ACKNOWLEDGED", receivedAt: new Date() });
    return new OrderAcknowledgedEvent({ orderId, restaurantId: this.restaurantId });
  }

  markReady(orderId: string): OrderReadyForPickupEvent {
    const ticket = this.tickets.get(orderId);
    if (!ticket) throw new Error("order not found");
    ticket.status = "READY_FOR_PICKUP";
    return new OrderReadyForPickupEvent({ orderId, restaurantId: this.restaurantId });
  }

  current(): OrderTicket[] {
    return Array.from(this.tickets.values());
  }
}
