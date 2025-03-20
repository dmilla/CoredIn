import { Controller, HttpException, HttpStatus } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TypedBody, TypedRoute } from "@nestia/core";
import { MaxLoginDurationMs } from "@coredin/shared";

interface LoginRequest {
  walletAddress: string;
  pubKey: string;
  signature: string;
  expiration: number;
}

@Controller("authentication")
export class AuthenticationController {
  constructor(private readonly jwtService: JwtService) {}

  @TypedRoute.Post("/login")
  async login(@TypedBody() loginRequest: LoginRequest): Promise<string> {
    console.log("Login requested", loginRequest);
    if (!loginRequest.signature || loginRequest.signature.length < 10) {
      throw new HttpException("Wrong signature length", HttpStatus.FORBIDDEN);
    }
    // Adding one day to max allowed timestamp to avoid using with users with unsynced clocks / wrong timezones
    // This implies we allow logins up to loginDurationMs + one day (currently 2h in total)
    const oneHourLoginMarginMs = 60 * 60 * 1000;
    if (
      !loginRequest.expiration ||
      loginRequest.expiration >
        Date.now() + MaxLoginDurationMs + oneHourLoginMarginMs
    ) {
      throw new HttpException("Invalid Expiration", HttpStatus.FORBIDDEN);
    }
    const jwt = this.jwtService.sign({
      ...loginRequest
    });

    return Promise.resolve(jwt);
  }
}
