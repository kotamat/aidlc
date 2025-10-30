import { RestaurantAccountAppService } from "../application/RestaurantAccountAppService";
import { MenuCatalogAppService } from "../application/MenuCatalogAppService";
import { OrderBoardAppService } from "../application/OrderBoardAppService";
import { AnalyticsAppService } from "../application/AnalyticsAppService";
import { OperatingHours } from "../domain/aggregates/RestaurantAccount";
import { MenuItem } from "../domain/aggregates/MenuCatalog";

export class RestaurantApi {
  constructor(
    private readonly accounts: RestaurantAccountAppService,
    private readonly menus: MenuCatalogAppService,
    private readonly orders: OrderBoardAppService,
    private readonly analytics: AnalyticsAppService,
  ) {}

  createRestaurant(id: string, name: string, hours: OperatingHours[]) {
    this.accounts.create(id, name, hours);
  }

  updateMenu(restaurantId: string, item: MenuItem) {
    this.menus.upsertItem(restaurantId, item);
  }

  publishMenu(restaurantId: string) {
    this.menus.publish(restaurantId);
  }

  acknowledgeOrder(restaurantId: string, orderId: string) {
    this.orders.acknowledge(restaurantId, orderId);
  }

  readyForPickup(restaurantId: string, orderId: string) {
    this.orders.readyForPickup(restaurantId, orderId);
  }

  analyticsSummary(restaurantId: string) {
    return this.analytics.summary(restaurantId);
  }
}
