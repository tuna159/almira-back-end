import { Module } from '@nestjs/common';
import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gift } from 'src/core/database/mysql/entity/gift.entity';

@Module({
  controllers: [GiftController],
  providers: [GiftService],
  imports: [TypeOrmModule.forFeature([Gift])],
  exports: [TypeOrmModule, GiftService],
})
export class GiftModule {}
