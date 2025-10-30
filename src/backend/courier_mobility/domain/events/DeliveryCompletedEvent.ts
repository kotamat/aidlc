import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface DeliveryCompletedPayload {
  jobId: string;
  courierId: string;
  orderId: string;
}

export class DeliveryCompletedEvent implements DomainEvent {
  readonly type = "courier.delivery.completed";
  readonly occurredAt: Date;

  constructor(readonly payload: DeliveryCompletedPayload) {
    this.occurredAt = new Date();
  }
}
