import { ApiSuiteRepository } from "../domain/repositories/ApiSuiteRepository";
import { ApiSuite } from "../domain/aggregates/ApiSuite";
import type { EventBus } from "../../shared/events/EventBus";

export class ApiSuiteAppService {
  constructor(
    private readonly suites: ApiSuiteRepository,
    private readonly eventBus: EventBus,
  ) {}

  register(name: string, owner: string): ApiSuite {
    const suite = new ApiSuite(name, owner);
    this.suites.save(suite);
    return suite;
  }

  publish(name: string, version: string): void {
    const suite = this.suites.findByName(name);
    if (!suite) throw new Error("suite not found");
    const event = suite.publish(version);
    this.suites.save(suite);
    this.eventBus.publish(event);
  }

  list() {
    return this.suites.list().map((suite) => suite.summary());
  }
}
