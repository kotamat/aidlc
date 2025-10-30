import { ChangeApprovedEvent } from "../events/ChangeApprovedEvent";

export type ChangeStatus = "PENDING" | "APPROVED" | "REJECTED";

export class IntegrationChangeRequest {
  private status: ChangeStatus = "PENDING";

  constructor(public readonly id: string, private readonly suite: string, private readonly description: string) {}

  approve(): ChangeApprovedEvent {
    this.status = "APPROVED";
    return new ChangeApprovedEvent({ requestId: this.id, suite: this.suite });
  }

  reject(): void {
    this.status = "REJECTED";
  }

  summary() {
    return { id: this.id, suite: this.suite, description: this.description, status: this.status };
  }
}
