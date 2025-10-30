import { AssignmentLifecycleService } from "../domain/services/AssignmentLifecycleService";

export class AssignmentAppService {
  constructor(private readonly lifecycle: AssignmentLifecycleService) {}

  acceptJob(courierId: string, jobId: string, orderId: string) {
    return this.lifecycle.accept(courierId, jobId, orderId);
  }

  complete(jobId: string) {
    this.lifecycle.complete(jobId);
  }
}
