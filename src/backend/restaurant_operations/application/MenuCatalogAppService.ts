import { MenuCatalogRepository } from "../domain/repositories/MenuCatalogRepository";
import { MenuCatalog, MenuItem } from "../domain/aggregates/MenuCatalog";
import type { EventBus } from "../../shared/events/EventBus";

export class MenuCatalogAppService {
  constructor(
    private readonly catalogs: MenuCatalogRepository,
    private readonly eventBus: EventBus,
  ) {}

  upsertItem(restaurantId: string, item: MenuItem): void {
    const catalog = this.ensureCatalog(restaurantId);
    catalog.upsertItem(item);
    this.catalogs.save(catalog);
  }

  publish(restaurantId: string): void {
    const catalog = this.ensureCatalog(restaurantId);
    const event = catalog.publish();
    this.catalogs.save(catalog);
    this.eventBus.publish(event);
  }

  list(restaurantId: string): MenuItem[] {
    return this.ensureCatalog(restaurantId).list();
  }

  private ensureCatalog(restaurantId: string): MenuCatalog {
    const existing = this.catalogs.findByRestaurantId(restaurantId);
    if (existing) return existing;
    const created = new MenuCatalog(restaurantId);
    this.catalogs.save(created);
    return created;
  }
}
