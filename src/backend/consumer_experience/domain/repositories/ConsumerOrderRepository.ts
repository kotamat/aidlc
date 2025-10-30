import { ConsumerOrder } from "../aggregates/ConsumerOrder";

export class ConsumerOrderRepository {
  private readonly store = new Map<string, ConsumerOrder>();

  save(order: ConsumerOrder): void {
    this.store.set(order.id, order);
  }

  findById(id: string): ConsumerOrder | undefined {
    return this.store.get(id);
  }

  all(): ConsumerOrder[] {
    return Array.from(this.store.values());
  }
}
