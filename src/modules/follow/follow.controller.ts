import { Controller, Get, Param } from '@nestjs/common';
import { UserData } from 'src/core/decorator/user.decorator';
import { IUserData } from 'src/core/interface/default.interface';
import { FollowService } from './follow.service';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Get(':user_id/following')
  async getFollowing(@UserData() userData: IUserData, @Param() param) {
    return await this.followService.getFollowing(userData, param.user_id);
  }

  @Get(':user_id/follower')
  async getFollower(@UserData() userData: IUserData, @Param() param) {
    return await this.followService.getFollower(userData, param.user_id);
  }
}
