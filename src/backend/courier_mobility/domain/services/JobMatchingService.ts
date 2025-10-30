import { JobOfferStreamRepository } from "../repositories/JobOfferStreamRepository";
import { JobOfferStream, JobOpportunity } from "../aggregates/JobOfferStream";
import type { EventBus } from "../../../shared/events/EventBus";

export class JobMatchingService {
  constructor(
    private readonly streams: JobOfferStreamRepository,
    private readonly eventBus: EventBus,
  ) {}

  offer(courierId: string, opportunity: JobOpportunity) {
    const stream = this.ensureStream(courierId);
    const event = stream.offer(opportunity);
    this.streams.save(stream);
    this.eventBus.publish(event);
  }

  list(courierId: string) {
    const stream = this.ensureStream(courierId);
    return stream.listActive();
  }

  private ensureStream(courierId: string): JobOfferStream {
    const found = this.streams.findByCourierId(courierId);
    if (found) return found;
    const created = new JobOfferStream(courierId);
    this.streams.save(created);
    return created;
  }
}
