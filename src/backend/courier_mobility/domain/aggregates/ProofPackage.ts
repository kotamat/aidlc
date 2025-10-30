export type ProofStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProofArtifact {
  type: "photo" | "signature" | "note";
  content: string;
}

export class ProofPackage {
  private status: ProofStatus = "PENDING";
  private artifacts: ProofArtifact[] = [];

  constructor(public readonly assignmentId: string) {}

  addArtifact(artifact: ProofArtifact): void {
    this.artifacts.push(artifact);
  }

  approve(): void {
    this.status = "APPROVED";
  }

  reject(): void {
    this.status = "REJECTED";
  }

  currentStatus(): ProofStatus {
    return this.status;
  }

  listArtifacts(): ProofArtifact[] {
    return [...this.artifacts];
  }
}
