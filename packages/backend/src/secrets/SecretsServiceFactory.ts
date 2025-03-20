import { ConfigService } from "@nestjs/config";
import { SecretsService } from "./SecretsService";

export const SecretsServiceFactory = {
  provide: SecretsService,
  useFactory: async (config: ConfigService) => {
    const secretsFilePath = config.get<string>(`secrets.file_path`);
    const secretsEnvPath = config.get<string>(`secrets.json_env_var`);
    return await SecretsService.fromEnvVarJsonFile(
      secretsEnvPath,
      secretsFilePath
    );
  },
  inject: [ConfigService]
};
