import { InternalEndpoint } from "@/authentication/guard";
import { UserService } from "@/user/user.service";
import { TypedBody, TypedRoute } from "@nestia/core";
import { Controller, UseGuards } from "@nestjs/common";

@Controller("internal")
@UseGuards(InternalEndpoint)
export class InternalController {
  constructor(private readonly userService: UserService) {}

  @TypedRoute.Post("onboard-issuer")
  async onboardIssuer(@TypedBody() data: { wallet: string }) {
    return this.userService.grantIssuerDid(data.wallet);
  }
}
