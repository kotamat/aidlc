import { EndpointSpecificationRepository } from "../domain/repositories/EndpointSpecificationRepository";
import { EndpointSpecification, RequestSchema, ResponseSchema } from "../domain/aggregates/EndpointSpecification";

export class EndpointSpecificationAppService {
  constructor(private readonly endpoints: EndpointSpecificationRepository) {}

  define(suite: string, method: string, path: string, request: RequestSchema, response: ResponseSchema): EndpointSpecification {
    const endpoint = new EndpointSpecification(suite, method, path, request, response);
    this.endpoints.save(endpoint);
    return endpoint;
  }

  update(suite: string, method: string, path: string, request: RequestSchema, response: ResponseSchema, description: string): void {
    const endpoint = this.endpoints.find(suite, method, path);
    if (!endpoint) throw new Error("endpoint not found");
    endpoint.update(request, response, description);
    this.endpoints.save(endpoint);
  }

  list(): EndpointSpecification[] {
    return this.endpoints.list();
  }
}
