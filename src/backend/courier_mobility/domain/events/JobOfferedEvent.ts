import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface JobOfferedPayload {
  jobId: string;
  courierId: string;
  pickup: string;
  dropoff: string;
  reward: number;
}

export class JobOfferedEvent implements DomainEvent {
  readonly type = "courier.job.offered";
  readonly occurredAt: Date;

  constructor(readonly payload: JobOfferedPayload) {
    this.occurredAt = new Date();
  }
}
