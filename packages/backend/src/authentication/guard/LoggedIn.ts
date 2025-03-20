import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthenticatedRequest } from "..";
import { AuthenticatedWalletGetter } from "../service";

@Injectable()
export class LoggedIn implements CanActivate {
  constructor(
    private readonly authenticatedWalletGetter: AuthenticatedWalletGetter
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    console.log("inside logged in");
    req.wallet = this.authenticatedWalletGetter.get(req);
    return true;
  }
}
