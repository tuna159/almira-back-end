import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { VSendMessage } from 'global/message/dto/send-messages';
import { UserData } from 'src/core/decorator/user.decorator';
import { IUserData } from 'src/core/interface/default.interface';
import { MessageService } from './message.service';
import { Public } from 'src/core/decorator/public.decorator';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  async getMessages(@UserData() userData: IUserData) {
    return await this.messageService.getMessages(userData);
  }

  @Get('users/:user_id')
  async handleGetMessageList(@UserData() userData: IUserData, @Param() params) {
    return await this.messageService.getMessageListByUserId(
      userData.user_id,
      params.user_id,
    );
  }

  @Post()
  async sendMessages(
    @UserData() userData: IUserData,
    @Body() body: VSendMessage,
  ) {
    return await this.messageService.sendMessages(userData.user_id, body);
  }
}
