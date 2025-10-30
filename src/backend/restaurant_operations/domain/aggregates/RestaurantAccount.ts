export interface OperatingHours {
  day: string;
  opensAt: string;
  closesAt: string;
}

export class RestaurantAccount {
  constructor(
    public readonly id: string,
    private readonly name: string,
    private operatingHours: OperatingHours[],
    private isClosed: boolean = false,
  ) {}

  updateHours(hours: OperatingHours[]): void {
    this.operatingHours = hours;
  }

  closeTemporarily(): void {
    this.isClosed = true;
  }

  reopen(): void {
    this.isClosed = false;
  }

  summary() {
    return { id: this.id, name: this.name, hours: [...this.operatingHours], closed: this.isClosed };
  }
}
