import type { DomainEvent } from "../../../shared/events/DomainEvent";

export interface MenuPublishedPayload {
  restaurantId: string;
  menuVersion: string;
}

export class MenuPublishedEvent implements DomainEvent {
  readonly type = "restaurant.menu.published";
  readonly occurredAt: Date;

  constructor(readonly payload: MenuPublishedPayload) {
    this.occurredAt = new Date();
  }
}
