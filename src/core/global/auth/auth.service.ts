/* eslint-disable @typescript-eslint/no-var-requires */
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { VLogin } from 'global/user/dto/login.dto';
import { VSignUp } from 'global/user/dto/signup.dto';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { handleBCRYPTCompare, handleBCRYPTHash } from 'src/helper/utils';
import { Connection } from 'typeorm';

import { UserService } from 'src/modules/user/user.service';
import { IResponseAuth } from './interface';
import { UserDetail } from 'src/core/database/mysql/entity/userDetail.entity';
import { UserDetailService } from 'src/modules/user-detail/user-detail.service';
import { VForgotPassword } from 'global/user/dto/forgotPassword.dto';
import { VResetPassword } from 'global/user/dto/resetPassword.dto';
import sendOTP from 'src/helper/sendOTP';
import { VVerify } from 'global/user/dto/verifyPassword.dto';

// import admin from 'src/main';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private userDetailService: UserDetailService,
    public jwtService: JwtService,
    private connection: Connection,
  ) {}

  async getUserById(user_id: string) {
    return await this.userService.getUserByUserId(user_id);
  }

  async returnResponseAuth(userExist): Promise<IResponseAuth> {
    const pointData = await this.userService.getUserPoint(userExist);

    const payloadToken = {
      user_id: userExist.user_id,
      total_points: pointData.total_points,
    };

    const token = this.jwtService.sign(payloadToken, {
      secret: process.env.SECRET_KEY,
      expiresIn: process.env.EXPRIE_TOKEN,
    });

    this.userService.updateUser(userExist.user_id, {
      token,
    });

    return {
      token,
      point_data: pointData,
    };
  }

  async signup(body: VSignUp) {
    const userName = await this.userService.getUserByUserName(body.username);

    if (userName) {
      throw new HttpException(
        ErrorMessage.USER_NAME_ALREADY_EXITS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const userParams = new User();
    userParams.user_name = body.username;
    userParams.password = await handleBCRYPTHash(body.password);
    userParams.phone_number = body.phone_number;
    userParams.is_deleted = EIsDelete.NOT_DELETE;
    userParams.total_points = 100;
    const user = await this.connection.transaction(async (manager) => {
      const newUser = await this.userService.createUser(userParams, manager);

      const userDetailParams = new UserDetail();
      userDetailParams.user_id = newUser.user_id;
      userDetailParams.email = body.email;
      userDetailParams.image_url = body?.image_url;
      userDetailParams.introduction = body.introduction;
      userDetailParams.latitude = body.latitude;
      userDetailParams.longitude = body.longitude;

      await this.userDetailService.createUserDetail(userDetailParams, manager);

      return await this.userService.findUserByUserId(newUser.user_id, manager);
    });

    const data = await this.returnResponseAuth(user);

    return {
      token: data.token,
      user_data: {
        user_id: user.user_id,
      },
    };
  }

  async login(body: VLogin) {
    const user = await this.userService.getUserByUserName(body.username);

    if (!user)
      throw new HttpException(
        ErrorMessage.USER_NAME_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );

    const password = await handleBCRYPTCompare(body.password, user.password);

    if (!password)
      throw new HttpException(
        ErrorMessage.PASSWORD_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );
    // const payloadToken = {
    //   user_id: user.user_id,
    // };

    const data = await this.returnResponseAuth(user);
    return {
      user_id: user.user_id,
      total_point: user.total_points,
      token: data.token,
    };
  }

  async forgotPassword(body: VForgotPassword) {
    const { phone_number } = body;

    const user = await this.userService.getUserByPhoneNumber(phone_number);

    if (!user) {
      throw new HttpException(
        ErrorMessage.USER_DOES_NOT_EXIST,
        HttpStatus.NOT_FOUND,
      );
    }

    const otp = Math.floor(Math.random() * 90000) + 1000;

    sendOTP(body.phone_number, otp);

    await this.userService.updateUserByPhoneNumber(body.phone_number, {
      OTP: otp,
    });

    return phone_number;
  }

  async verifyPassword(body: VVerify) {
    const otpUser = await this.userService.getUserByOtp(body.OTP);

    if (!otpUser) {
      throw new HttpException(ErrorMessage.OTP_INCORECT, HttpStatus.NOT_FOUND);
    }

    if (otpUser.OTP == body.OTP) {
      await this.userService.updateOTP(body.OTP, {
        OTP: null,
      });
    }

    return {
      user_id: otpUser.user_id,
    };
  }

  async resetPassword(body: VResetPassword) {
    const { user_id, password } = body;

    const user = await this.userService.getUserByUserID({ user_id: user_id });

    if (!user) {
      throw new HttpException(
        ErrorMessage.USER_DOES_NOT_EXIST,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.userService.updateUser(user_id, {
      password: await handleBCRYPTHash(password),
    });

    const data = await this.returnResponseAuth(user);
    return {
      user_id: user.user_id,
      total_point: user.total_points,
      token: data.token,
    };
  }

  async logout(token: string, userId: string) {
    this.userService.updateUser(userId, {
      token: null,
    });
  }
}
