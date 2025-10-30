interface RestaurantSummary {
  id: string;
  name: string;
  etaMinutes: number;
}

export class RestaurantDiscoveryAppService {
  constructor(private readonly catalog: RestaurantSummary[]) {}

  search(keyword?: string): RestaurantSummary[] {
    if (!keyword) return [...this.catalog];
    return this.catalog.filter((restaurant) => restaurant.name.toLowerCase().includes(keyword.toLowerCase()));
  }
}
