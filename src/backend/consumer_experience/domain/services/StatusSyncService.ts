import { ConsumerOrderRepository } from "../repositories/ConsumerOrderRepository";
import { OrderExperienceTimelineRepository } from "../repositories/OrderExperienceTimelineRepository";
import { OrderExperienceTimeline } from "../aggregates/OrderExperienceTimeline";
import { OrderStatusUpdatedEvent } from "../events/OrderStatusUpdatedEvent";

export class StatusSyncService {
  constructor(
    private readonly orders: ConsumerOrderRepository,
    private readonly timelines: OrderExperienceTimelineRepository,
  ) {}

  apply(event: OrderStatusUpdatedEvent): void {
    const order = this.orders.findById(event.payload.orderId);
    if (!order) return;
    order.applyStatus(event.payload.status);
    this.orders.save(order);

    const timeline =
      this.timelines.findByOrderId(event.payload.orderId) ?? new OrderExperienceTimeline(event.payload.orderId);
    timeline.recordCheckpoint(event.payload.status, `Status updated by ${event.payload.source}`);
    this.timelines.save(timeline);
  }
}
