export interface EarningLineItem {
  assignmentId: string;
  amount: number;
  description: string;
}

export class PayoutStatement {
  private readonly lineItems: EarningLineItem[] = [];
  private status: "PLANNED" | "PROCESSING" | "PAID" = "PLANNED";

  constructor(public readonly courierId: string, public readonly period: string) {}

  addLineItem(item: EarningLineItem): void {
    this.lineItems.push(item);
  }

  setStatus(status: "PLANNED" | "PROCESSING" | "PAID"): void {
    this.status = status;
  }

  summary() {
    const total = this.lineItems.reduce((sum, item) => sum + item.amount, 0);
    return { total, status: this.status, items: [...this.lineItems] };
  }
}
