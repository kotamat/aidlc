import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface RiskDetectedPayload {
  riskId: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
}

export class RiskDetectedEvent implements DomainEvent {
  readonly type = "operations.risk.detected";
  readonly occurredAt: Date;

  constructor(readonly payload: RiskDetectedPayload) {
    this.occurredAt = new Date();
  }
}
