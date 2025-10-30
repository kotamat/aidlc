import { CityOperationsBoard } from "../aggregates/CityOperationsBoard";

export class CityOperationsBoardRepository {
  private readonly store = new Map<string, CityOperationsBoard>();

  save(board: CityOperationsBoard): void {
    this.store.set(board.cityId, board);
  }

  findByCityId(cityId: string): CityOperationsBoard | undefined {
    return this.store.get(cityId);
  }
}
