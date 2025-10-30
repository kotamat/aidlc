import { SupportTicketRepository } from "../domain/repositories/SupportTicketRepository";
import { RiskCaseRepository } from "../domain/repositories/RiskCaseRepository";

export class ReportingAppService {
  constructor(
    private readonly tickets: SupportTicketRepository,
    private readonly risks: RiskCaseRepository,
  ) {}

  overview() {
    return {
      tickets: this.tickets.list().map((ticket) => ticket.snapshot()),
      risks: this.risks.list().map((risk) => risk.snapshot()),
    };
  }
}
