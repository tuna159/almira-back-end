import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserData } from 'src/core/decorator/user.decorator';
import {
  IPaginationQuery,
  IUserData,
} from 'src/core/interface/default.interface';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('users/:user_id')
  async handleGetMessageList(
    @Query() query: IPaginationQuery,
    @UserData() userData: IUserData,
    @Param() params,
  ) {
    return await this.messageService.getMessageListByUserId(
      userData,
      params.user_id,
      query,
    );
  }
}
