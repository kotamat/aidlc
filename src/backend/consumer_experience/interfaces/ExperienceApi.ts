import { RestaurantDiscoveryAppService } from "../application/RestaurantDiscoveryAppService";
import { CheckoutAppService } from "../application/CheckoutAppService";
import { CartAppService } from "../application/CartAppService";
import { TrackingAppService } from "../application/TrackingAppService";

export class ExperienceApi {
  constructor(
    private readonly discovery: RestaurantDiscoveryAppService,
    private readonly checkout: CheckoutAppService,
    private readonly cart: CartAppService,
    private readonly tracking: TrackingAppService,
  ) {}

  listRestaurants(keyword?: string) {
    return this.discovery.search(keyword);
  }

  async createOrder(cartId: string, consumerId: string) {
    return this.checkout.checkout(cartId, consumerId);
  }

  addCartItem(cartId: string, item: { itemId: string; name: string; price: number; quantity: number }) {
    this.cart.addItem(cartId, item);
  }

  viewCart(cartId: string) {
    return this.cart.list(cartId);
  }

  tracking(orderId: string) {
    return this.tracking.getTracking(orderId);
  }
}
