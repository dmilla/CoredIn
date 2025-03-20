import { Controller, Delete, Get, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthenticatedRequest } from "../authentication";
import { LoggedIn } from "../authentication/guard";
// import { UserProfile } from "@coredin/shared";
// import { TypedBody, TypedRoute } from "@nestia/core";
import { Effect } from "effect";
import { WaltIdWalletService } from "@/ssi/core/services";
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from "@nestia/core";
import { UpdateProfileDTO } from "@coredin/shared";

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WaltIdWalletService
  ) {}

  @Get("profile/:wallet")
  @UseGuards(LoggedIn)
  async getProfile(
    @Req() req: AuthenticatedRequest,
    @TypedParam("wallet") wallet: string
  ) {
    console.log("User requested: ", req.wallet);
    await this.userService.updateLastSeen(req.wallet);
    const user = await Effect.runPromise(
      await this.userService.getPublicOrPrivate(req.wallet, wallet)
    );

    return user;
  }

  @Get("search")
  @UseGuards(LoggedIn)
  async search(
    @Req() req: AuthenticatedRequest,
    @TypedQuery() params: { username: string }
  ) {
    return this.userService.searchUsers(params.username);
  }

  @Get("tips")
  @UseGuards(LoggedIn)
  async getTips(@Req() req: AuthenticatedRequest) {
    console.log("request tips");
    return this.userService.getTips(req.wallet);
  }

  @TypedRoute.Put("tips")
  @UseGuards(LoggedIn)
  async updateTipsSeen(
    @Req() req: AuthenticatedRequest,
    @TypedBody() { tipIds }: { tipIds: number[] }
  ) {
    return this.userService.updateTipsSeen(req.wallet, tipIds);
  }

  @TypedRoute.Post()
  @UseGuards(LoggedIn)
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @TypedBody() profile: UpdateProfileDTO
  ) {
    const res = await this.userService.updateProfile(req.wallet, profile);

    return res.affected === 1;
  }

  @Delete("credentials/:id")
  @UseGuards(LoggedIn)
  async deleteCredential(
    @Req() req: AuthenticatedRequest,
    @TypedParam("id") id: string,
    @TypedQuery() { permanent }: { permanent: boolean }
  ) {
    return this.walletService.deleteCredential(req.wallet, id, permanent);
  }
}
