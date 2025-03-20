import { SecretsService } from "@/secrets/SecretsService";
import { FeatureFlagClient, UnleashFeatureFlagClient } from "../services";
import { ConfigService } from "@nestjs/config";
import * as unleash from "unleash-client";

export const FeatureFlagClientProvider = {
  provide: FeatureFlagClient,
  useFactory: (config: ConfigService, secrets: SecretsService) => {
    const unleashConfig = config.get<unleash.UnleashConfig>("unleash")!;
    const instanceId = secrets.get("unleash_instance_id");
    console.log("FeatureFlagClientProvider", { unleashConfig, instanceId });
    return new UnleashFeatureFlagClient({ ...unleashConfig, instanceId });
  },
  inject: [ConfigService, SecretsService]
};
