import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface JobAcceptedPayload {
  jobId: string;
  courierId: string;
}

export class JobAcceptedEvent implements DomainEvent {
  readonly type = "courier.job.accepted";
  readonly occurredAt: Date;

  constructor(readonly payload: JobAcceptedPayload) {
    this.occurredAt = new Date();
  }
}
