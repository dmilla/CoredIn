import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { WALLET_HEADER } from '..';

@Injectable()
export class AuthenticatedWalletGetter {
  get(req: Request): string {
    const wallet = req.headers[WALLET_HEADER];
    if (typeof wallet !== 'string') {
      throw new UnauthorizedException('Authentication required');
    }

    return wallet;
  }
}
