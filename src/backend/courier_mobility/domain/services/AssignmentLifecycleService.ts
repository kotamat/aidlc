import { DeliveryAssignmentRepository } from "../repositories/DeliveryAssignmentRepository";
import { DeliveryAssignment } from "../aggregates/DeliveryAssignment";
import { JobOfferStreamRepository } from "../repositories/JobOfferStreamRepository";
import { ProofPackageRepository } from "../repositories/ProofPackageRepository";
import { ProofPackage } from "../aggregates/ProofPackage";
import type { EventBus } from "../../../shared/events/EventBus";

export class AssignmentLifecycleService {
  constructor(
    private readonly assignments: DeliveryAssignmentRepository,
    private readonly streams: JobOfferStreamRepository,
    private readonly proofs: ProofPackageRepository,
    private readonly eventBus: EventBus,
  ) {}

  accept(courierId: string, jobId: string, orderId: string): DeliveryAssignment {
    const stream = this.streams.findByCourierId(courierId);
    if (!stream) throw new Error("no offers available");
    const job = stream.consume(jobId);
    if (!job) throw new Error("job not found or expired");

    const assignment = new DeliveryAssignment(jobId, courierId, orderId);
    this.assignments.save(assignment);
    this.streams.save(stream);

    const event = assignment.accept();
    this.eventBus.publish(event);

    const proof = new ProofPackage(jobId);
    this.proofs.save(proof);

    return assignment;
  }

  complete(jobId: string): void {
    const assignment = this.assignments.findById(jobId);
    if (!assignment) throw new Error("assignment not found");
    const event = assignment.complete();
    this.assignments.save(assignment);
    this.eventBus.publish(event);

    const proof = this.proofs.findByAssignmentId(jobId);
    if (proof) {
      proof.approve();
      this.proofs.save(proof);
    }
  }
}
