import { AuthenticationModule } from "../authentication";
import { UserController } from "./user.controller";
import { Module } from "@nestjs/common";
import { User } from "./user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from "./user.service";
import { SsiModule } from "../ssi/app/ssi.module";
import { CoreumModule } from "@/coreum/app/coreum.module";
import { Tip } from "../posts/tips/tip.entity";

@Module({
  imports: [
    AuthenticationModule,
    SsiModule,
    TypeOrmModule.forFeature([User, Tip]),
    CoreumModule
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
