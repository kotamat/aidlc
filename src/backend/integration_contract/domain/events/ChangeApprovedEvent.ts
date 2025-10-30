import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface ChangeApprovedPayload {
  requestId: string;
  suite: string;
}

export class ChangeApprovedEvent implements DomainEvent {
  readonly type = "integration.change.approved";
  readonly occurredAt: Date;

  constructor(readonly payload: ChangeApprovedPayload) {
    this.occurredAt = new Date();
  }
}
