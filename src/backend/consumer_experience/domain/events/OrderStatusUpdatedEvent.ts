import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface OrderStatusUpdatedPayload {
  orderId: string;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "EN_ROUTE" | "DELIVERED" | "FAILED";
  source: "restaurant" | "courier" | "system";
}

export class OrderStatusUpdatedEvent implements DomainEvent {
  readonly type = "consumer.order.status.updated";
  readonly occurredAt: Date;

  constructor(readonly payload: OrderStatusUpdatedPayload) {
    this.occurredAt = new Date();
  }
}
