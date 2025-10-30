import { CourierJobAppService } from "../application/CourierJobAppService";
import { AssignmentAppService } from "../application/AssignmentAppService";
import { EarningsAppService } from "../application/EarningsAppService";

export class CourierApi {
  constructor(
    private readonly jobs: CourierJobAppService,
    private readonly assignments: AssignmentAppService,
    private readonly earnings: EarningsAppService,
  ) {}

  listJobs(courierId: string) {
    return this.jobs.listJobs(courierId);
  }

  acceptJob(courierId: string, jobId: string, orderId: string) {
    return this.assignments.acceptJob(courierId, jobId, orderId);
  }

  complete(jobId: string) {
    this.assignments.complete(jobId);
  }

  earningsSummary(courierId: string, period: string) {
    return this.earnings.summary(courierId, period);
  }
}
