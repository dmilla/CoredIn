import { Module } from "@nestjs/common";
import { FeatureFlagClientProvider } from "./providers";
import { FeatureFlagsController } from "./feature-flag.controller";
import { SecretsModule } from "@/secrets/secrets.module";

@Module({
  imports: [SecretsModule],
  providers: [FeatureFlagClientProvider],
  controllers: [FeatureFlagsController],
  exports: [FeatureFlagClientProvider]
})
export class FeatureFlagModule {}
