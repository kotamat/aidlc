export interface RequestSchema {
  required: string[];
}

export interface ResponseSchema {
  status: number;
}

export class EndpointSpecification {
  private history: string[] = [];

  constructor(
    public readonly suite: string,
    public readonly method: string,
    public readonly path: string,
    private requestSchema: RequestSchema,
    private responseSchema: ResponseSchema,
  ) {}

  update(request: RequestSchema, response: ResponseSchema, description: string): void {
    this.requestSchema = request;
    this.responseSchema = response;
    this.history.push(description);
  }

  snapshot() {
    return {
      suite: this.suite,
      method: this.method,
      path: this.path,
      request: this.requestSchema,
      response: this.responseSchema,
      history: [...this.history],
    };
  }
}
