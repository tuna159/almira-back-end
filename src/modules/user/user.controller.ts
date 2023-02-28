import { Body, Controller, Get, Post } from '@nestjs/common';
import { VLogin } from 'global/user/dto/login.dto';
import { VSignUp } from 'global/user/dto/signup.dto';
import { Public } from 'src/core/decorator/public.decorator';
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
}
