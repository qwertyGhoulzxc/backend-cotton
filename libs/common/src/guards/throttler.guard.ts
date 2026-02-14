import { JwtPayload } from '@auth/interfaces';
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard as TThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class ThrottlerGuard extends TThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const user = req.user as JwtPayload | undefined;
    if (user?.id) {
      return `user_${user.id}`;
    }

    return req.ips.length ? req.ips[0] : req.ip;
  }
}

// import { JwtPayload } from '@auth/interfaces';
// import { ExecutionContext, Injectable } from '@nestjs/common';
// import { ThrottlerGuard as TThrottlerGuard } from '@nestjs/throttler';
// import { Request } from 'express';

// @Injectable()
// export class ThrottlerGuard extends TThrottlerGuard {
//   public async canActivate(context: ExecutionContext): Promise<boolean> {
//     const req = context.switchToHttp().getRequest<Request>();
//     if (req.user && (req.user as JwtPayload).roles?.includes('admin')) {
//       return true;
//     }

//     return super.canActivate(context);
//   }

//   protected async getTracker(req: Request): Promise<string> {
//     const user = req.user as JwtPayload | undefined;
//     if (user?.id) {
//       return `user_${user.id}`;
//     }

//     return req.ips.length ? req.ips[0] : req.ip;
//   }
// }
