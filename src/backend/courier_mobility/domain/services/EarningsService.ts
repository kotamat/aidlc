import { PayoutStatementRepository } from "../repositories/PayoutStatementRepository";
import { PayoutStatement } from "../aggregates/PayoutStatement";

export class EarningsService {
  constructor(private readonly statements: PayoutStatementRepository) {}

  record(courierId: string, period: string, assignmentId: string, amount: number): void {
    const statement = this.ensureStatement(courierId, period);
    statement.addLineItem({ assignmentId, amount, description: "delivery reward" });
    this.statements.save(statement);
  }

  markPaid(courierId: string, period: string): void {
    const statement = this.ensureStatement(courierId, period);
    statement.setStatus("PAID");
    this.statements.save(statement);
  }

  summary(courierId: string, period: string) {
    return this.ensureStatement(courierId, period).summary();
  }

  private ensureStatement(courierId: string, period: string): PayoutStatement {
    const found = this.statements.findByKey(courierId, period);
    if (found) return found;
    const statement = new PayoutStatement(courierId, period);
    this.statements.save(statement);
    return statement;
  }
}
