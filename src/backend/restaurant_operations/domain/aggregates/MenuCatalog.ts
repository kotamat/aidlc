import { MenuPublishedEvent } from "../events/MenuPublishedEvent";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export class MenuCatalog {
  private items: MenuItem[] = [];
  private version = "v1";

  constructor(public readonly restaurantId: string) {}

  upsertItem(item: MenuItem): void {
    const index = this.items.findIndex((existing) => existing.id === item.id);
    if (index >= 0) {
      this.items[index] = item;
    } else {
      this.items.push(item);
    }
  }

  publish(): MenuPublishedEvent {
    this.version = `v${Date.now()}`;
    return new MenuPublishedEvent({ restaurantId: this.restaurantId, menuVersion: this.version });
  }

  list(): MenuItem[] {
    return [...this.items];
  }
}
