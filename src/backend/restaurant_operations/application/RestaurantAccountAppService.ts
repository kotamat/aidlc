import { RestaurantAccountRepository } from "../domain/repositories/RestaurantAccountRepository";
import { RestaurantAccount, OperatingHours } from "../domain/aggregates/RestaurantAccount";

export class RestaurantAccountAppService {
  constructor(private readonly accounts: RestaurantAccountRepository) {}

  create(id: string, name: string, hours: OperatingHours[]): RestaurantAccount {
    const account = new RestaurantAccount(id, name, hours);
    this.accounts.save(account);
    return account;
  }

  updateHours(id: string, hours: OperatingHours[]): void {
    const account = this.requireAccount(id);
    account.updateHours(hours);
    this.accounts.save(account);
  }

  summary(id: string) {
    return this.requireAccount(id).summary();
  }

  private requireAccount(id: string): RestaurantAccount {
    const account = this.accounts.findById(id);
    if (!account) throw new Error("restaurant not found");
    return account;
  }
}
