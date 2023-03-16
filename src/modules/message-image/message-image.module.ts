import { Module } from '@nestjs/common';
import { MessageImageService } from './message-image.service';
import { MessageImageController } from './message-image.controller';
import { MessageImage } from 'src/core/database/mysql/entity/messageImage.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [MessageImageController],
  providers: [MessageImageService],
  imports: [TypeOrmModule.forFeature([MessageImage])],
  exports: [TypeOrmModule, MessageImageService],
})
export class MessageImageModule {}
