import { RiskDetectedEvent } from "../events/RiskDetectedEvent";

export type RiskStatus = "OPEN" | "MITIGATING" | "CLOSED";

export class RiskCase {
  private status: RiskStatus = "OPEN";

  constructor(public readonly id: string, private severity: "LOW" | "MEDIUM" | "HIGH", private description: string) {}

  detectEvent(): RiskDetectedEvent {
    return new RiskDetectedEvent({ riskId: this.id, severity: this.severity, description: this.description });
  }

  updateStatus(status: RiskStatus): void {
    this.status = status;
  }

  snapshot() {
    return { id: this.id, severity: this.severity, description: this.description, status: this.status };
  }
}
