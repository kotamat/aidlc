import { JobOfferedEvent } from "../events/JobOfferedEvent";

export interface JobOpportunity {
  jobId: string;
  orderId: string;
  pickup: string;
  dropoff: string;
  reward: number;
  expiresAt: Date;
}

export class JobOfferStream {
  private readonly offers = new Map<string, JobOpportunity>();

  constructor(public readonly courierId: string) {}

  offer(job: JobOpportunity): JobOfferedEvent {
    this.offers.set(job.jobId, job);
    return new JobOfferedEvent({
      jobId: job.jobId,
      courierId: this.courierId,
      pickup: job.pickup,
      dropoff: job.dropoff,
      reward: job.reward,
    });
  }

  listActive(now: Date = new Date()): JobOpportunity[] {
    return Array.from(this.offers.values()).filter((job) => job.expiresAt.getTime() > now.getTime());
  }

  consume(jobId: string): JobOpportunity | undefined {
    const job = this.offers.get(jobId);
    if (job) {
      this.offers.delete(jobId);
    }
    return job;
  }
}
