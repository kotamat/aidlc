import { RestaurantAccount } from "../aggregates/RestaurantAccount";

export class RestaurantAccountRepository {
  private readonly store = new Map<string, RestaurantAccount>();

  save(account: RestaurantAccount): void {
    this.store.set(account.id, account);
  }

  findById(id: string): RestaurantAccount | undefined {
    return this.store.get(id);
  }
}
