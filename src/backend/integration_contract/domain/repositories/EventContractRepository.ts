import { EventContract } from "../aggregates/EventContract";

export class EventContractRepository {
  private readonly store = new Map<string, EventContract>();

  save(contract: EventContract): void {
    this.store.set(this.key(contract.suite, contract.name), contract);
  }

  find(suite: string, name: string): EventContract | undefined {
    return this.store.get(this.key(suite, name));
  }

  private key(suite: string, name: string): string {
    return `${suite}:${name}`;
  }
}
