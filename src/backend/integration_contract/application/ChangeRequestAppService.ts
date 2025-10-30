import { IntegrationChangeRequestRepository } from "../domain/repositories/IntegrationChangeRequestRepository";
import { IntegrationChangeRequest } from "../domain/aggregates/IntegrationChangeRequest";
import type { EventBus } from "../../shared/events/EventBus";

export class ChangeRequestAppService {
  constructor(
    private readonly requests: IntegrationChangeRequestRepository,
    private readonly eventBus: EventBus,
  ) {}

  submit(id: string, suite: string, description: string): IntegrationChangeRequest {
    const request = new IntegrationChangeRequest(id, suite, description);
    this.requests.save(request);
    return request;
  }

  approve(id: string): void {
    const request = this.requests.findById(id);
    if (!request) throw new Error("request not found");
    const event = request.approve();
    this.requests.save(request);
    this.eventBus.publish(event);
  }
}
