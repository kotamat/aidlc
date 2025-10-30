import { ApiSuiteAppService } from "../application/ApiSuiteAppService";
import { EndpointSpecificationAppService } from "../application/EndpointSpecificationAppService";
import { EventContractAppService } from "../application/EventContractAppService";
import { ChangeRequestAppService } from "../application/ChangeRequestAppService";

export class IntegrationApi {
  constructor(
    private readonly suites: ApiSuiteAppService,
    private readonly endpoints: EndpointSpecificationAppService,
    private readonly events: EventContractAppService,
    private readonly changes: ChangeRequestAppService,
  ) {}

  registerSuite(name: string, owner: string) {
    this.suites.register(name, owner);
  }

  publishSuite(name: string, version: string) {
    this.suites.publish(name, version);
  }

  defineEndpoint(suite: string, method: string, path: string) {
    this.endpoints.define(suite, method, path, { required: [] }, { status: 200 });
  }

  registerEvent(suite: string, name: string) {
    this.events.register(suite, name, { fields: [] }, 7);
  }

  submitChange(id: string, suite: string, description: string) {
    this.changes.submit(id, suite, description);
  }

  approveChange(id: string) {
    this.changes.approve(id);
  }
}
