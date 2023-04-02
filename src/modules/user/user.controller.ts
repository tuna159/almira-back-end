import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Delete,
  Put,
} from '@nestjs/common';
import { VForgotPassword } from 'global/user/dto/forgotPassword.dto';
import { VLogin } from 'global/user/dto/login.dto';
import { VResetPassword } from 'global/user/dto/resetPassword.dto';
import { VSignUp } from 'global/user/dto/signup.dto';
import { Public } from 'src/core/decorator/public.decorator';
import { UserData } from 'src/core/decorator/user.decorator';
import {
  IPaginationQuery,
  IUserData,
} from 'src/core/interface/default.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('login')
  async login(@Body() body: VLogin) {
    return this.userService.login(body);
  }

  @Public()
  @Post('signup')
  async signup(@Body() body: VSignUp) {
    return this.userService.signup(body);
  }

  @Get('')
  async getUser() {
    return this.userService.getUser();
  }

  @Get('/search')
  async getPosts(
    @UserData() userData: IUserData,
    @Query() query: IPaginationQuery,
  ) {
    return await this.userService.getUserName(userData, query);
  }

  // @Get('/token')
  // async getToken(@UserData() userData: IUserData) {
  //   return await this.userService.getToken(userData);
  // }

  @Get(':user_id')
  async getUserDetail(@UserData() userData: IUserData, @Param() param) {
    return await this.userService.getUserDetail(userData, param.user_id);
  }

  @Post('/:user_id/follow')
  async handleFollowUser(@UserData() userData: IUserData, @Param() param) {
    return await this.userService.followUser(userData, param.user_id);
  }

  @Delete('/:user_id/unfollow')
  async handleUnollowUser(@UserData() userData: IUserData, @Param() param) {
    return await this.userService.unFollowUser(userData, param.user_id);
  }

  @Delete('/:user_id/unfollower')
  async handleUnollowerUser(@UserData() userData: IUserData, @Param() param) {
    return await this.userService.unFollowerUser(userData, param.user_id);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: VForgotPassword) {
    return this.userService.forgotPassword(body);
  }

  @Public()
  @Put('reset-password')
  async resetPassword(@Body() body: VResetPassword) {
    return this.userService.resetPassword(body);
  }
}
