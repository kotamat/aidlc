import { ConsumerOrderRepository } from "../domain/repositories/ConsumerOrderRepository";
import { OrderStatusUpdatedEvent } from "../domain/events/OrderStatusUpdatedEvent";
import { StatusSyncService } from "../domain/services/StatusSyncService";
import type { EventBus } from "../../shared/events/EventBus";

export class OrderLifecycleAppService {
  constructor(
    private readonly orders: ConsumerOrderRepository,
    private readonly statusSync: StatusSyncService,
    private readonly eventBus: EventBus,
  ) {}

  requestStatusUpdate(orderId: string, status: OrderStatusUpdatedEvent["payload"]["status"], source: OrderStatusUpdatedEvent["payload"]["source"]) {
    const order = this.orders.findById(orderId);
    if (!order) throw new Error("order not found");
    const event = new OrderStatusUpdatedEvent({ orderId, status, source });
    this.statusSync.apply(event);
    this.eventBus.publish(event);
  }
}
