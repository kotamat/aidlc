import { OrderExperienceTimelineRepository } from "../domain/repositories/OrderExperienceTimelineRepository";

export class TrackingAppService {
  constructor(private readonly timelines: OrderExperienceTimelineRepository) {}

  getTracking(orderId: string) {
    const timeline = this.timelines.findByOrderId(orderId);
    if (!timeline) {
      throw new Error("tracking not found");
    }
    return {
      orderId,
      latest: timeline.latest(),
      history: timeline.history(),
    };
  }
}
