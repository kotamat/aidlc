import { JobOfferStream } from "../aggregates/JobOfferStream";

export class JobOfferStreamRepository {
  private readonly store = new Map<string, JobOfferStream>();

  save(stream: JobOfferStream): void {
    this.store.set(stream.courierId, stream);
  }

  findByCourierId(courierId: string): JobOfferStream | undefined {
    return this.store.get(courierId);
  }
}
