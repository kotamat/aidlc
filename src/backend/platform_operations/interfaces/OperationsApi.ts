import { TicketRoutingAppService } from "../application/TicketRoutingAppService";
import { RiskAssessmentAppService } from "../application/RiskAssessmentAppService";
import { AlertManagementAppService } from "../application/AlertManagementAppService";
import { WorkflowOrchestrationAppService } from "../application/WorkflowOrchestrationAppService";
import { ReportingAppService } from "../application/ReportingAppService";

export class OperationsApi {
  constructor(
    private readonly tickets: TicketRoutingAppService,
    private readonly risks: RiskAssessmentAppService,
    private readonly alerts: AlertManagementAppService,
    private readonly workflows: WorkflowOrchestrationAppService,
    private readonly reports: ReportingAppService,
  ) {}

  createTicket(id: string, category: string, priority: "LOW" | "HIGH") {
    this.tickets.create(id, category, priority);
  }

  updateTicketStatus(id: string, status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED") {
    this.tickets.updateStatus(id, status);
  }

  openRisk(id: string, severity: "LOW" | "MEDIUM" | "HIGH", description: string) {
    this.risks.openCase(id, severity, description);
  }

  updateCityIndicator(cityId: string, indicator: string, value: number, threshold: number) {
    this.alerts.update(cityId, indicator, value, threshold);
  }

  startWorkflow(id: string, steps: string[]) {
    this.workflows.startWorkflow(id, steps);
  }

  overview() {
    return this.reports.overview();
  }
}
