import { OrderExperienceTimeline } from "../aggregates/OrderExperienceTimeline";

export class OrderExperienceTimelineRepository {
  private readonly store = new Map<string, OrderExperienceTimeline>();

  save(timeline: OrderExperienceTimeline): void {
    this.store.set(timeline.orderId, timeline);
  }

  findByOrderId(orderId: string): OrderExperienceTimeline | undefined {
    return this.store.get(orderId);
  }
}
