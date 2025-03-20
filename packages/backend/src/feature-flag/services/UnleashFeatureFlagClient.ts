import * as unleash from "unleash-client";
import { FeatureFlagClient } from ".";
import { FEATURE_FLAG } from "@coredin/shared";

export class UnleashFeatureFlagClient extends FeatureFlagClient {
  private readonly client: unleash.Unleash;

  constructor(unleashConfig: unleash.UnleashConfig) {
    super();
    this.client = unleash.initialize(unleashConfig);
  }

  isEnabled(featureFlag: FEATURE_FLAG, wallet?: string): boolean {
    const ctx: unleash.Context = {
      userId: wallet ?? "unknown"
    };
    return this.client.isEnabled(featureFlag, ctx);
  }
}
