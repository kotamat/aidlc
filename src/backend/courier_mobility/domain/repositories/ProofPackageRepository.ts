import { ProofPackage } from "../aggregates/ProofPackage";

export class ProofPackageRepository {
  private readonly store = new Map<string, ProofPackage>();

  save(pkg: ProofPackage): void {
    this.store.set(pkg.assignmentId, pkg);
  }

  findByAssignmentId(assignmentId: string): ProofPackage | undefined {
    return this.store.get(assignmentId);
  }
}
