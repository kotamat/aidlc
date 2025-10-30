export interface TrackingCheckpoint {
  status: string;
  occurredAt: Date;
  note?: string;
}

export class OrderExperienceTimeline {
  private readonly checkpoints: TrackingCheckpoint[] = [];

  constructor(public readonly orderId: string) {}

  recordCheckpoint(status: string, note?: string): void {
    this.checkpoints.push({ status, note, occurredAt: new Date() });
  }

  history(): TrackingCheckpoint[] {
    return [...this.checkpoints];
  }

  latest(): TrackingCheckpoint | undefined {
    return this.checkpoints[this.checkpoints.length - 1];
  }
}
