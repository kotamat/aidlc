import { OpsWorkflow } from "../aggregates/OpsWorkflow";

export class OpsWorkflowRepository {
  private readonly store = new Map<string, OpsWorkflow>();

  save(workflow: OpsWorkflow): void {
    this.store.set(workflow.id, workflow);
  }

  findById(id: string): OpsWorkflow | undefined {
    return this.store.get(id);
  }
}
