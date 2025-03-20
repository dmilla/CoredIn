import { Controller, Get } from "@nestjs/common";
import { FeatureFlagClient } from "./services";
import { FEATURE_FLAG } from "@coredin/shared";
import { TypedQuery } from "@nestia/core";

@Controller("feature-flags")
export class FeatureFlagsController {
  constructor(private readonly featureFlagClient: FeatureFlagClient) {}

  @Get()
  isEnabled(
    @TypedQuery() params: { flag: FEATURE_FLAG; wallet?: string }
  ): boolean {
    console.log("FeatureFlagsController.isEnabled", params);
    return this.featureFlagClient.isEnabled(
      params.flag,
      params.wallet?.toLowerCase()
    );
  }
}
