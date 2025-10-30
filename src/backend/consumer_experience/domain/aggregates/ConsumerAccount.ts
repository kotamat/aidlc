export interface PaymentProfile {
  id: string;
  active: boolean;
}

export class ConsumerAccount {
  constructor(
    public readonly id: string,
    private paymentProfiles: PaymentProfile[],
    private defaultPaymentMethodId: string | null,
    private favoriteRestaurants: string[] = [],
  ) {}

  registerPaymentProfile(profile: PaymentProfile): void {
    if (this.paymentProfiles.some((p) => p.id === profile.id)) {
      throw new Error("payment profile already exists");
    }
    this.paymentProfiles.push(profile);
    if (!this.defaultPaymentMethodId) {
      this.defaultPaymentMethodId = profile.id;
    }
  }

  getDefaultPaymentMethodId(): string {
    if (!this.defaultPaymentMethodId) {
      throw new Error("no default payment method");
    }
    return this.defaultPaymentMethodId;
  }

  markPaymentInactive(profileId: string): void {
    const found = this.paymentProfiles.find((p) => p.id === profileId);
    if (!found) {
      throw new Error("payment profile not found");
    }
    found.active = false;
    if (this.defaultPaymentMethodId === profileId) {
      this.defaultPaymentMethodId = null;
    }
  }

  listActivePayments(): PaymentProfile[] {
    return this.paymentProfiles.filter((p) => p.active);
  }
}
