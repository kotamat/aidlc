import { OrderBoardRepository } from "../domain/repositories/OrderBoardRepository";
import { OrderBoard } from "../domain/aggregates/OrderBoard";
import type { EventBus } from "../../shared/events/EventBus";

export class OrderBoardAppService {
  constructor(
    private readonly boards: OrderBoardRepository,
    private readonly eventBus: EventBus,
  ) {}

  acknowledge(restaurantId: string, orderId: string): void {
    const board = this.ensureBoard(restaurantId);
    const event = board.accept(orderId);
    this.boards.save(board);
    this.eventBus.publish(event);
  }

  readyForPickup(restaurantId: string, orderId: string): void {
    const board = this.ensureBoard(restaurantId);
    const event = board.markReady(orderId);
    this.boards.save(board);
    this.eventBus.publish(event);
  }

  listTickets(restaurantId: string) {
    return this.ensureBoard(restaurantId).current();
  }

  private ensureBoard(restaurantId: string): OrderBoard {
    const existing = this.boards.findByRestaurantId(restaurantId);
    if (existing) return existing;
    const created = new OrderBoard(restaurantId);
    this.boards.save(created);
    return created;
  }
}
