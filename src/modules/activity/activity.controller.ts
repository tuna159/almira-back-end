import { Controller, Get, Query } from '@nestjs/common';
import { UserData } from 'src/core/decorator/user.decorator';
import {
  IPaginationQuery,
  IUserData,
} from 'src/core/interface/default.interface';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async handleGetActivity(
    @Query() query: IPaginationQuery,
    @UserData() userData: IUserData,
  ) {
    return await this.activityService.handleGetActivity(
      userData.user_id,
      query,
    );
  }
}
