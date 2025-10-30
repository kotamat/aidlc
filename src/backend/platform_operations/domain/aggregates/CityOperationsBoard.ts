import { AlertTriggeredEvent } from "../events/AlertTriggeredEvent";

interface CityIndicator {
  name: string;
  value: number;
  threshold: number;
}

export class CityOperationsBoard {
  private indicators: CityIndicator[] = [];

  constructor(public readonly cityId: string) {}

  updateIndicator(name: string, value: number, threshold: number): AlertTriggeredEvent | null {
    const indicator = this.indicators.find((item) => item.name === name);
    if (indicator) {
      indicator.value = value;
      indicator.threshold = threshold;
    } else {
      this.indicators.push({ name, value, threshold });
    }
    if (value > threshold) {
      return new AlertTriggeredEvent({ cityId: this.cityId, indicator: name, severity: "CRITICAL" });
    }
    return null;
  }

  snapshot() {
    return [...this.indicators];
  }
}
