import { ConsumerAccount } from "../aggregates/ConsumerAccount";

export class ConsumerAccountRepository {
  private readonly store = new Map<string, ConsumerAccount>();

  save(account: ConsumerAccount): void {
    this.store.set(account.id, account);
  }

  findById(id: string): ConsumerAccount | undefined {
    return this.store.get(id);
  }
}
