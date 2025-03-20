import { WaltIdVerifierService } from "@/ssi/core/services";
import { ConfigService } from "@nestjs/config";

export const WaltIdVerifierServiceProvider = {
  provide: WaltIdVerifierService,
  useFactory: (config: ConfigService) => {
    const issuerApiUrl = config.get("verifier.api.url");
    return new WaltIdVerifierService(issuerApiUrl);
  },
  inject: [ConfigService]
};
