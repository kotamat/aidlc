import { ApiSuite } from "../aggregates/ApiSuite";

export class ApiSuiteRepository {
  private readonly store = new Map<string, ApiSuite>();

  save(suite: ApiSuite): void {
    this.store.set(suite.name, suite);
  }

  findByName(name: string): ApiSuite | undefined {
    return this.store.get(name);
  }

  list(): ApiSuite[] {
    return Array.from(this.store.values());
  }
}
