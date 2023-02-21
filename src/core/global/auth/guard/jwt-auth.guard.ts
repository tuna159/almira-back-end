import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ErrorMessage } from 'enum/error';
import { IS_PUBLIC_KEY } from 'src/core/decorator/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private tokenFromHeader: string;

  constructor(private reflector: Reflector) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    this.tokenFromHeader = request?.headers?.authorization?.replace(
      /(Bearer\s)/,
      '',
    );

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err, user, info: Error) {
    if (info?.name === 'TokenExpiredError')
      throw new HttpException(
        ErrorMessage.TOKEN_EXPIRED,
        HttpStatus.UNAUTHORIZED,
      );

    console.log(this.tokenFromHeader, user, 1111111);

    if (this.tokenFromHeader !== user?.token) {
      throw new HttpException(
        ErrorMessage.INVALID_TOKEN,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
