import { Module } from "@nestjs/common";
import { CoredinContractService } from "../services";
import {
  CoredinContractServiceProvider,
  CoredinSignerServiceProvider
} from "./providers";
import { SecretsModule } from "@/secrets/secrets.module";

@Module({
  imports: [SecretsModule],
  providers: [CoredinContractServiceProvider, CoredinSignerServiceProvider],
  exports: [CoredinContractService]
})
export class CoreumModule {}
