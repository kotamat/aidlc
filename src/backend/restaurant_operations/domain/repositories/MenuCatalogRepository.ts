import { MenuCatalog } from "../aggregates/MenuCatalog";

export class MenuCatalogRepository {
  private readonly store = new Map<string, MenuCatalog>();

  save(catalog: MenuCatalog): void {
    this.store.set(catalog.restaurantId, catalog);
  }

  findByRestaurantId(restaurantId: string): MenuCatalog | undefined {
    return this.store.get(restaurantId);
  }
}
