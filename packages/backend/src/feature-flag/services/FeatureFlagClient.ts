import { FEATURE_FLAG } from "@coredin/shared";

export abstract class FeatureFlagClient {
  abstract isEnabled(featureFlag: FEATURE_FLAG, wallet?: string): boolean;
}
