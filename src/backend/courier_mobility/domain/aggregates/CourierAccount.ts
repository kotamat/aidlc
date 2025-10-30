export type EligibilityStatus = "ACTIVE" | "SUSPENDED";

export class CourierAccount {
  constructor(
    public readonly id: string,
    private status: EligibilityStatus,
    private readonly transport: "bike" | "car" | "scooter",
    private readonly preferredZones: string[],
  ) {}

  isEligible(): boolean {
    return this.status === "ACTIVE";
  }

  suspend(): void {
    this.status = "SUSPENDED";
  }

  activate(): void {
    this.status = "ACTIVE";
  }

  getTransport(): string {
    return this.transport;
  }

  zones(): string[] {
    return [...this.preferredZones];
  }
}
