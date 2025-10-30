export interface NotificationMessage {
  orderId: string;
  message: string;
}

export class NotificationGateway {
  private readonly outbox: NotificationMessage[] = [];

  enqueue(message: NotificationMessage): void {
    this.outbox.push(message);
  }

  drain(): NotificationMessage[] {
    const copy = [...this.outbox];
    this.outbox.length = 0;
    return copy;
  }
}
