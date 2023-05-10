import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from 'src/modules/message/message.module';

@Module({
  providers: [ChatGateway],
  imports: [MessageModule],
})
export class ChatGatewayModule {}
