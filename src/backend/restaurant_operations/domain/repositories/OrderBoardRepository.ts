import { OrderBoard } from "../aggregates/OrderBoard";

export class OrderBoardRepository {
  private readonly store = new Map<string, OrderBoard>();

  save(board: OrderBoard): void {
    this.store.set(board.restaurantId, board);
  }

  findByRestaurantId(restaurantId: string): OrderBoard | undefined {
    return this.store.get(restaurantId);
  }
}
