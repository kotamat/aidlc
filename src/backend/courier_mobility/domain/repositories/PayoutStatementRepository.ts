import { PayoutStatement } from "../aggregates/PayoutStatement";

export class PayoutStatementRepository {
  private readonly store = new Map<string, PayoutStatement>();

  save(statement: PayoutStatement): void {
    this.store.set(this.key(statement.courierId, statement.period), statement);
  }

  findByKey(courierId: string, period: string): PayoutStatement | undefined {
    return this.store.get(this.key(courierId, period));
  }

  private key(courierId: string, period: string): string {
    return `${courierId}_${period}`;
  }
}
