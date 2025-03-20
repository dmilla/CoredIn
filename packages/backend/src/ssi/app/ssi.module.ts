import { Module } from "@nestjs/common";
import {
  WaltIdIssuerService,
  WaltIdVerifierService,
  WaltIdWalletService
} from "@/ssi/core/services";
import { ConfigModule } from "@nestjs/config";
import {
  WaltIdIssuerServiceProvider,
  WaltIdVerifierServiceProvider,
  WaltIdWalletServiceProvider
} from "./providers";
import { SecretsModule } from "@/secrets/secrets.module";

@Module({
  imports: [ConfigModule, SecretsModule],
  providers: [
    WaltIdWalletServiceProvider,
    WaltIdIssuerServiceProvider,
    WaltIdVerifierServiceProvider
  ],
  exports: [WaltIdWalletService, WaltIdIssuerService, WaltIdVerifierService]
})
export class SsiModule {}
