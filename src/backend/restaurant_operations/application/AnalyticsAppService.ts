import { RevenueLedgerRepository } from "../domain/repositories/RevenueLedgerRepository";
import { RevenueLedger } from "../domain/aggregates/RevenueLedger";

export class AnalyticsAppService {
  constructor(private readonly ledgers: RevenueLedgerRepository) {}

  record(restaurantId: string, period: string, revenue: number, cancelled: number): void {
    const ledger = this.ensureLedger(restaurantId);
    ledger.record(period, revenue, cancelled);
    this.ledgers.save(ledger);
  }

  summary(restaurantId: string) {
    return this.ensureLedger(restaurantId).summary();
  }

  private ensureLedger(restaurantId: string): RevenueLedger {
    const existing = this.ledgers.findByRestaurantId(restaurantId);
    if (existing) return existing;
    const ledger = new RevenueLedger(restaurantId);
    this.ledgers.save(ledger);
    return ledger;
  }
}
