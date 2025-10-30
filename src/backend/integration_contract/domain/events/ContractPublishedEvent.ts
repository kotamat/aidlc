import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface ContractPublishedPayload {
  suite: string;
  version: string;
}

export class ContractPublishedEvent implements DomainEvent {
  readonly type = "integration.contract.published";
  readonly occurredAt: Date;

  constructor(readonly payload: ContractPublishedPayload) {
    this.occurredAt = new Date();
  }
}
