import { Controller, Get } from '@nestjs/common';
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
}
