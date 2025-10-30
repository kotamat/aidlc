import { CheckoutOrchestrator } from "../domain/services/CheckoutOrchestrator";
import { ShoppingCartRepository } from "../domain/repositories/ShoppingCartRepository";
import { ShoppingCart } from "../domain/aggregates/ShoppingCart";

export class CheckoutAppService {
  constructor(
    private readonly carts: ShoppingCartRepository,
    private readonly orchestrator: CheckoutOrchestrator,
  ) {}

  initializeCart(consumerId: string, restaurantId: string): ShoppingCart {
    const cart = new ShoppingCart(`cart_${Date.now()}`, consumerId, restaurantId);
    this.carts.save(cart);
    return cart;
  }

  async checkout(cartId: string, consumerId: string) {
    return this.orchestrator.placeOrder({ cartId, consumerId });
  }
}
