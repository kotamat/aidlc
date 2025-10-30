import { EarningsService } from "../domain/services/EarningsService";

export class EarningsAppService {
  constructor(private readonly earnings: EarningsService) {}

  recordDelivery(courierId: string, period: string, assignmentId: string, amount: number) {
    this.earnings.record(courierId, period, assignmentId, amount);
  }

  payout(courierId: string, period: string) {
    this.earnings.markPaid(courierId, period);
  }

  summary(courierId: string, period: string) {
    return this.earnings.summary(courierId, period);
  }
}
