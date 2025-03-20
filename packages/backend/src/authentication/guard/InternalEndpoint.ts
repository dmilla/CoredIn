import { SecretsService } from "@/secrets/SecretsService";
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class InternalEndpoint implements CanActivate {
  constructor(
    @Inject(SecretsService) private readonly secretsService: SecretsService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException("Missing private token");
    }

    const authHeaderParts = authHeader.split(" ");
    if (authHeaderParts.length < 2) {
      throw new UnauthorizedException(
        "Missing private token (Malformed authorization)"
      );
    }

    if (authHeaderParts[0].toLowerCase() !== "basic") {
      throw new UnauthorizedException("Only <Basic> authorization supported");
    }

    const headerSecret = Buffer.from(authHeaderParts[1], "base64").toString(
      "ascii"
    );
    const authSecrets = this.secretsService
      .get("internal_endpoint_secrets")
      .split("|");

    for (let i = 0; i < authSecrets.length; i++) {
      const secret = authSecrets[i];
      if (secret === headerSecret) {
        return true;
      }
    }

    throw new UnauthorizedException("Authorization secret mismatch");
  }
}
