import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface OrderReadyForPickupPayload {
  orderId: string;
  restaurantId: string;
}

export class OrderReadyForPickupEvent implements DomainEvent {
  readonly type = "restaurant.order.ready";
  readonly occurredAt: Date;

  constructor(readonly payload: OrderReadyForPickupPayload) {
    this.occurredAt = new Date();
  }
}
