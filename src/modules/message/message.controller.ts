import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { VSendMessage } from 'global/message/dto/send-messages';
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

  @Post()
  async sendMessages(
    @UserData() userData: IUserData,
    @Body() body: VSendMessage,
  ) {
    return await this.messageService.sendMessages(userData, body);
  }
}
