import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface OrderPlacedPayload {
  orderId: string;
  consumerId: string;
  restaurantId: string;
  totalAmount: number;
}

export class OrderPlacedEvent implements DomainEvent {
  readonly type = "consumer.order.placed";
  readonly occurredAt: Date;

  constructor(readonly payload: OrderPlacedPayload) {
    this.occurredAt = new Date();
  }
}
