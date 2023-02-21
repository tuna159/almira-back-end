import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_KEY,
    });
  }

  async validate(payload: any) {
    if (payload?.type === 0) {
      return payload;
    }
    const userExist = await this.authService.getUserById(payload.user_id);
    if (!userExist || userExist.is_deleted === EIsDelete.DELETED)
      throw new HttpException(
        ErrorMessage.ACCOUNT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );

    return {
      ...payload,
      token: userExist.token,
    };
  }
}
