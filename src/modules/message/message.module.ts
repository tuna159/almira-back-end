import { forwardRef, Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from 'src/core/database/mysql/entity/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { MessageImageModule } from '../message-image/message-image.module';
import { ChatGatewayModule } from 'src/core/global/chat/chat.gateway.module';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
  imports: [
    TypeOrmModule.forFeature([Message]),
    forwardRef(() => UserModule),
    MessageImageModule,
    forwardRef(() => ChatGatewayModule),
  ],
  exports: [TypeOrmModule, MessageService],
})
export class MessageModule {}
