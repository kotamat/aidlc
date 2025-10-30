import { EndpointSpecification } from "../aggregates/EndpointSpecification";

export class EndpointSpecificationRepository {
  private readonly store = new Map<string, EndpointSpecification>();

  save(endpoint: EndpointSpecification): void {
    this.store.set(this.key(endpoint.suite, endpoint.method, endpoint.path), endpoint);
  }

  find(suite: string, method: string, path: string): EndpointSpecification | undefined {
    return this.store.get(this.key(suite, method, path));
  }

  list(): EndpointSpecification[] {
    return Array.from(this.store.values());
  }

  private key(suite: string, method: string, path: string): string {
    return `${suite}:${method}:${path}`;
  }
}
