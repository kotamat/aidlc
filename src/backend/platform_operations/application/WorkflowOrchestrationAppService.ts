import { OpsWorkflowRepository } from "../domain/repositories/OpsWorkflowRepository";
import { OpsWorkflow } from "../domain/aggregates/OpsWorkflow";

export class WorkflowOrchestrationAppService {
  constructor(private readonly workflows: OpsWorkflowRepository) {}

  startWorkflow(id: string, steps: string[]): OpsWorkflow {
    const workflow = new OpsWorkflow(id, steps);
    this.workflows.save(workflow);
    return workflow;
  }

  completeStep(id: string, stepName: string): void {
    const workflow = this.workflows.findById(id);
    if (!workflow) throw new Error("workflow not found");
    workflow.completeStep(stepName);
    this.workflows.save(workflow);
  }

  summary(id: string) {
    const workflow = this.workflows.findById(id);
    if (!workflow) throw new Error("workflow not found");
    return workflow.summary();
  }
}
