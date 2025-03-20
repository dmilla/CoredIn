import { UserModule } from "@/user/user.module";
import { AuthenticationModule } from "../authentication";
import { InternalController } from "./internal.controller";
import { Module } from "@nestjs/common";

@Module({
  imports: [AuthenticationModule, UserModule],
  providers: [],
  controllers: [InternalController],
  exports: []
})
export class InternalModule {}
