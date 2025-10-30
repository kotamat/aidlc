import { CityOperationsBoardRepository } from "../domain/repositories/CityOperationsBoardRepository";
import { CityOperationsBoard } from "../domain/aggregates/CityOperationsBoard";
import type { EventBus } from "../../shared/events/EventBus";

export class AlertManagementAppService {
  constructor(
    private readonly boards: CityOperationsBoardRepository,
    private readonly eventBus: EventBus,
  ) {}

  update(cityId: string, indicator: string, value: number, threshold: number): void {
    const board = this.ensureBoard(cityId);
    const alert = board.updateIndicator(indicator, value, threshold);
    this.boards.save(board);
    if (alert) {
      this.eventBus.publish(alert);
    }
  }

  snapshot(cityId: string) {
    return this.ensureBoard(cityId).snapshot();
  }

  private ensureBoard(cityId: string): CityOperationsBoard {
    const existing = this.boards.findByCityId(cityId);
    if (existing) return existing;
    const board = new CityOperationsBoard(cityId);
    this.boards.save(board);
    return board;
  }
}
