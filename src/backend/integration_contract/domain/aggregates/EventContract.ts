export interface EventPayloadSchema {
  fields: string[];
}

export class EventContract {
  constructor(
    public readonly suite: string,
    public readonly name: string,
    private payloadSchema: EventPayloadSchema,
    private retentionDays: number,
  ) {}

  update(schema: EventPayloadSchema, retentionDays: number): void {
    this.payloadSchema = schema;
    this.retentionDays = retentionDays;
  }

  snapshot() {
    return { suite: this.suite, name: this.name, payload: this.payloadSchema, retentionDays: this.retentionDays };
  }
}
