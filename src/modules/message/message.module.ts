import { forwardRef, Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from 'src/core/database/mysql/entity/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
  imports: [TypeOrmModule.forFeature([Message]), forwardRef(() => UserModule)],
  exports: [TypeOrmModule, MessageService],
})
export class MessageModule {}
