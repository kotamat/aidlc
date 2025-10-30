import { ShoppingCart } from "../aggregates/ShoppingCart";

export class ShoppingCartRepository {
  private readonly store = new Map<string, ShoppingCart>();

  save(cart: ShoppingCart): void {
    this.store.set(cart.id, cart);
  }

  findById(id: string): ShoppingCart | undefined {
    return this.store.get(id);
  }

  delete(id: string): void {
    this.store.delete(id);
  }
}
