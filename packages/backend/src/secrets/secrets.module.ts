import { Global, Module } from "@nestjs/common";
import { SecretsServiceFactory } from "./SecretsServiceFactory";
import { SecretsService } from "./SecretsService";

@Global()
@Module({
	providers: [SecretsServiceFactory],
	exports: [SecretsService]
})
export class SecretsModule {}
