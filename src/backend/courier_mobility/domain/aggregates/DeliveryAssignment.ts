import { JobAcceptedEvent } from "../events/JobAcceptedEvent";
import { DeliveryCompletedEvent } from "../events/DeliveryCompletedEvent";

export type AssignmentStatus = "ACCEPTED" | "PICKED_UP" | "DELIVERING" | "COMPLETED" | "FAILED";

export class DeliveryAssignment {
  private status: AssignmentStatus = "ACCEPTED";
  private checkpoints: { status: AssignmentStatus; occurredAt: Date }[] = [];

  constructor(public readonly id: string, public readonly courierId: string, public readonly orderId: string) {
    this.checkpoints.push({ status: this.status, occurredAt: new Date() });
  }

  accept(): JobAcceptedEvent {
    return new JobAcceptedEvent({ jobId: this.id, courierId: this.courierId });
  }

  updateStatus(status: AssignmentStatus): void {
    this.status = status;
    this.checkpoints.push({ status, occurredAt: new Date() });
  }

  complete(): DeliveryCompletedEvent {
    this.updateStatus("COMPLETED");
    return new DeliveryCompletedEvent({ jobId: this.id, courierId: this.courierId, orderId: this.orderId });
  }

  history(): { status: AssignmentStatus; occurredAt: Date }[] {
    return [...this.checkpoints];
  }

  currentStatus(): AssignmentStatus {
    return this.status;
  }
}
