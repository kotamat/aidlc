import { RiskCase } from "../aggregates/RiskCase";

export class RiskCaseRepository {
  private readonly store = new Map<string, RiskCase>();

  save(risk: RiskCase): void {
    this.store.set(risk.id, risk);
  }

  findById(id: string): RiskCase | undefined {
    return this.store.get(id);
  }

  list(): RiskCase[] {
    return Array.from(this.store.values());
  }
}
