import { RiskCaseRepository } from "../domain/repositories/RiskCaseRepository";
import { RiskCase, RiskStatus } from "../domain/aggregates/RiskCase";
import type { EventBus } from "../../shared/events/EventBus";

export class RiskAssessmentAppService {
  constructor(
    private readonly risks: RiskCaseRepository,
    private readonly eventBus: EventBus,
  ) {}

  openCase(id: string, severity: "LOW" | "MEDIUM" | "HIGH", description: string): RiskCase {
    const risk = new RiskCase(id, severity, description);
    this.risks.save(risk);
    this.eventBus.publish(risk.detectEvent());
    return risk;
  }

  updateStatus(id: string, status: RiskStatus): void {
    const risk = this.risks.findById(id);
    if (!risk) throw new Error("risk not found");
    risk.updateStatus(status);
    this.risks.save(risk);
  }

  get(id: string) {
    const risk = this.risks.findById(id);
    if (!risk) throw new Error("risk not found");
    return risk.snapshot();
  }
}
