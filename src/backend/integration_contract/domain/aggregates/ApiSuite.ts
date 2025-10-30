import { ContractPublishedEvent } from "../events/ContractPublishedEvent";

export class ApiSuite {
  private versions: Set<string> = new Set();
  private latestVersion: string | null = null;

  constructor(public readonly name: string, private readonly owner: string) {}

  publish(version: string): ContractPublishedEvent {
    this.versions.add(version);
    this.latestVersion = version;
    return new ContractPublishedEvent({ suite: this.name, version });
  }

  summary() {
    return { name: this.name, owner: this.owner, versions: Array.from(this.versions), latest: this.latestVersion };
  }
}
