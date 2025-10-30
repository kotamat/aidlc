import { ShoppingCartRepository } from "../domain/repositories/ShoppingCartRepository";
import { CartItem } from "../domain/aggregates/ShoppingCart";

export class CartAppService {
  constructor(private readonly carts: ShoppingCartRepository) {}

  addItem(cartId: string, item: CartItem): void {
    const cart = this.carts.findById(cartId);
    if (!cart) throw new Error("cart not found");
    cart.addItem(item);
    this.carts.save(cart);
  }

  list(cartId: string): CartItem[] {
    const cart = this.carts.findById(cartId);
    if (!cart) throw new Error("cart not found");
    return cart.getItems();
  }
}
