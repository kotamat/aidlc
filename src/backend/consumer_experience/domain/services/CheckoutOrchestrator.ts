import { ConsumerAccountRepository } from "../repositories/ConsumerAccountRepository";
import { ShoppingCartRepository } from "../repositories/ShoppingCartRepository";
import { ConsumerOrder } from "../aggregates/ConsumerOrder";
import { ConsumerOrderRepository } from "../repositories/ConsumerOrderRepository";
import { OrderExperienceTimeline } from "../aggregates/OrderExperienceTimeline";
import { OrderExperienceTimelineRepository } from "../repositories/OrderExperienceTimelineRepository";
import { OrderPlacedEvent } from "../events/OrderPlacedEvent";
import type { EventBus } from "../../../shared/events/EventBus";

interface CheckoutRequest {
  cartId: string;
  consumerId: string;
}

export class CheckoutOrchestrator {
  constructor(
    private readonly accounts: ConsumerAccountRepository,
    private readonly carts: ShoppingCartRepository,
    private readonly orders: ConsumerOrderRepository,
    private readonly timelines: OrderExperienceTimelineRepository,
    private readonly eventBus: EventBus,
  ) {}

  async placeOrder(request: CheckoutRequest): Promise<ConsumerOrder> {
    const cart = this.carts.findById(request.cartId);
    if (!cart) throw new Error("cart not found");

    const account = this.accounts.findById(request.consumerId);
    if (!account) throw new Error("consumer account not found");
    account.getDefaultPaymentMethodId(); // validate existence

    const orderId = `ord_${Date.now()}`;
    const snapshot = cart.snapshot();
    const order = new ConsumerOrder(orderId, {
      items: snapshot.items,
      total: snapshot.total,
      restaurantId: snapshot.restaurantId,
      consumerId: snapshot.consumerId,
      promotion: snapshot.promotion,
    });
    this.orders.save(order);

    const timeline = new OrderExperienceTimeline(orderId);
    timeline.recordCheckpoint("PENDING", "Order placed");
    this.timelines.save(timeline);

    cart.clear();
    this.carts.save(cart);

    await this.eventBus.publish(
      new OrderPlacedEvent({
        orderId,
        consumerId: request.consumerId,
        restaurantId: snapshot.restaurantId,
        totalAmount: snapshot.total,
      }),
    );

    return order;
  }
}
