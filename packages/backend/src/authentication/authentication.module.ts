import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticatedWalletGetter } from "./service";
import { SecretsService } from "../secrets/SecretsService";
import { SecretsModule } from "../secrets/secrets.module";

const jwtModule = JwtModule.registerAsync({
  useFactory: async (secrets: SecretsService) => ({
    secret: secrets.get("jwt_secret")
  }),
  inject: [SecretsService]
});

@Global()
@Module({
  imports: [SecretsModule, jwtModule],
  controllers: [AuthenticationController],
  providers: [AuthenticatedWalletGetter],
  exports: [jwtModule, AuthenticatedWalletGetter]
})
export class AuthenticationModule {}
