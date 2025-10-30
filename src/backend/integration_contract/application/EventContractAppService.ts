import { EventContractRepository } from "../domain/repositories/EventContractRepository";
import { EventContract, EventPayloadSchema } from "../domain/aggregates/EventContract";

export class EventContractAppService {
  constructor(private readonly events: EventContractRepository) {}

  register(suite: string, name: string, payload: EventPayloadSchema, retentionDays: number): EventContract {
    const contract = new EventContract(suite, name, payload, retentionDays);
    this.events.save(contract);
    return contract;
  }

  update(suite: string, name: string, payload: EventPayloadSchema, retentionDays: number): void {
    const contract = this.events.find(suite, name);
    if (!contract) throw new Error("event contract not found");
    contract.update(payload, retentionDays);
    this.events.save(contract);
  }
}
