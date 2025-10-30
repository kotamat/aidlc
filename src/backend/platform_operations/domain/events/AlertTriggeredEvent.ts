import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface AlertTriggeredPayload {
  cityId: string;
  indicator: string;
  severity: "INFO" | "WARN" | "CRITICAL";
}

export class AlertTriggeredEvent implements DomainEvent {
  readonly type = "operations.city.alert";
  readonly occurredAt: Date;

  constructor(readonly payload: AlertTriggeredPayload) {
    this.occurredAt = new Date();
  }
}
