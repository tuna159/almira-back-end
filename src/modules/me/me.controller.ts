import { Body, Controller, Get, Post } from '@nestjs/common';
import { VBlockUser } from 'global/user/dto/blockUser.dto';
import { UserData } from 'src/core/decorator/user.decorator';
import { IUserData } from 'src/core/interface/default.interface';
import { MeService } from './me.service';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  async getPosts(@UserData() userData: IUserData) {
    return await this.meService.getMe(userData);
  }

  @Post('blocks')
  async blockUser(@UserData() userData: IUserData, @Body() body: VBlockUser) {
    return await this.meService.blockUser(body.user_id, userData);
  }
}
