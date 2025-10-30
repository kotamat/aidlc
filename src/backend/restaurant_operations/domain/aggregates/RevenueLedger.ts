export interface SalesMetric {
  period: string;
  revenue: number;
  cancelled: number;
}

export class RevenueLedger {
  private readonly metrics: SalesMetric[] = [];

  constructor(public readonly restaurantId: string) {}

  record(period: string, revenue: number, cancelled: number): void {
    this.metrics.push({ period, revenue, cancelled });
  }

  summary(): SalesMetric[] {
    return [...this.metrics];
  }
}
