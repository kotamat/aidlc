export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export class ShoppingCart {
  private items = new Map<string, CartItem>();
  private appliedPromotion: string | null = null;

  constructor(public readonly id: string, public readonly consumerId: string, public readonly restaurantId: string) {}

  addItem(item: CartItem): void {
    this.items.set(item.itemId, item);
  }

  removeItem(itemId: string): void {
    this.items.delete(itemId);
  }

  applyPromotion(code: string): void {
    this.appliedPromotion = code;
  }

  getItems(): CartItem[] {
    return Array.from(this.items.values());
  }

  clear(): void {
    this.items.clear();
    this.appliedPromotion = null;
  }

  total(): number {
    return this.getItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  snapshot() {
    return {
      cartId: this.id,
      consumerId: this.consumerId,
      restaurantId: this.restaurantId,
      items: this.getItems(),
      promotion: this.appliedPromotion,
      total: this.total(),
    };
  }
}
