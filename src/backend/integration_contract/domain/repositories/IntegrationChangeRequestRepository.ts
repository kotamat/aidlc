import { IntegrationChangeRequest } from "../aggregates/IntegrationChangeRequest";

export class IntegrationChangeRequestRepository {
  private readonly store = new Map<string, IntegrationChangeRequest>();

  save(request: IntegrationChangeRequest): void {
    this.store.set(request.id, request);
  }

  findById(id: string): IntegrationChangeRequest | undefined {
    return this.store.get(id);
  }
}
