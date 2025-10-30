export type WorkflowStepStatus = "PENDING" | "DONE";

export class OpsWorkflow {
  private readonly steps: { name: string; status: WorkflowStepStatus }[] = [];

  constructor(public readonly id: string, names: string[]) {
    names.forEach((name) => this.steps.push({ name, status: "PENDING" }));
  }

  completeStep(name: string): void {
    const step = this.steps.find((item) => item.name === name);
    if (!step) throw new Error("step not found");
    step.status = "DONE";
  }

  summary() {
    return { id: this.id, steps: [...this.steps] };
  }
}
