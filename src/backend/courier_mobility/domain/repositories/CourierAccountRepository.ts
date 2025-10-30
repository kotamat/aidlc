import { CourierAccount } from "../aggregates/CourierAccount";

export class CourierAccountRepository {
  private readonly store = new Map<string, CourierAccount>();

  save(account: CourierAccount): void {
    this.store.set(account.id, account);
  }

  findById(id: string): CourierAccount | undefined {
    return this.store.get(id);
  }
}
