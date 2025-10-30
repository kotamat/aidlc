export type FulfillmentStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "EN_ROUTE" | "DELIVERED" | "FAILED";

export interface OrderSnapshot {
  items: { itemId: string; name: string; price: number; quantity: number }[];
  total: number;
  restaurantId: string;
  consumerId: string;
  promotion?: string | null;
}

export class ConsumerOrder {
  private status: FulfillmentStatus = "PENDING";
  private changeRequests: string[] = [];
  private cancellationReason: string | null = null;

  constructor(public readonly id: string, private readonly snapshot: OrderSnapshot) {}

  getStatus(): FulfillmentStatus {
    return this.status;
  }

  snapshotDetails(): OrderSnapshot {
    return this.snapshot;
  }

  applyStatus(status: FulfillmentStatus): void {
    this.status = status;
  }

  requestChange(description: string): void {
    this.changeRequests.push(description);
  }

  changeHistory(): string[] {
    return [...this.changeRequests];
  }

  requestCancellation(reason: string): void {
    this.cancellationReason = reason;
  }

  cancellation(): string | null {
    return this.cancellationReason;
  }
}
