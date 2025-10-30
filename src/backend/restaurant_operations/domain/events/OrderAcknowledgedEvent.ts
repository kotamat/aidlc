import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface OrderAcknowledgedPayload {
  orderId: string;
  restaurantId: string;
}

export class OrderAcknowledgedEvent implements DomainEvent {
  readonly type = "restaurant.order.acknowledged";
  readonly occurredAt: Date;

  constructor(readonly payload: OrderAcknowledgedPayload) {
    this.occurredAt = new Date();
  }
}
