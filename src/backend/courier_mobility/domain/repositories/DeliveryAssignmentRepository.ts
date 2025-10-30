import { DeliveryAssignment } from "../aggregates/DeliveryAssignment";

export class DeliveryAssignmentRepository {
  private readonly store = new Map<string, DeliveryAssignment>();

  save(assignment: DeliveryAssignment): void {
    this.store.set(assignment.id, assignment);
  }

  findById(id: string): DeliveryAssignment | undefined {
    return this.store.get(id);
  }
}
