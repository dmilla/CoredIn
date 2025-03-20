import { AuthenticationModule } from "../authentication";
import { Module } from "@nestjs/common";
import { UserModule } from "@/user/user.module";
import { SsiModule } from "@/ssi/app/ssi.module";
import { IssuersController } from "./issuers.controller";
import { IssuanceRequest } from "./issuance_request.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreumModule } from "@/coreum/app/coreum.module";
import { IssuersService } from "./issuers.service";

@Module({
  imports: [
    AuthenticationModule,
    UserModule,
    SsiModule,
    CoreumModule,
    TypeOrmModule.forFeature([IssuanceRequest])
  ],
  providers: [IssuersService],
  controllers: [IssuersController],
  exports: []
})
export class IssuersModule {}
