import { JobMatchingService } from "../domain/services/JobMatchingService";
import { JobOpportunity } from "../domain/aggregates/JobOfferStream";

export class CourierJobAppService {
  constructor(private readonly matching: JobMatchingService) {}

  listJobs(courierId: string) {
    return this.matching.list(courierId);
  }

  pushOpportunity(courierId: string, opportunity: JobOpportunity) {
    this.matching.offer(courierId, opportunity);
  }
}
