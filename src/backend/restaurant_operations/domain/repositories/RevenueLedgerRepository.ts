import { RevenueLedger } from "../aggregates/RevenueLedger";

export class RevenueLedgerRepository {
  private readonly store = new Map<string, RevenueLedger>();

  save(ledger: RevenueLedger): void {
    this.store.set(ledger.restaurantId, ledger);
  }

  findByRestaurantId(restaurantId: string): RevenueLedger | undefined {
    return this.store.get(restaurantId);
  }
}
