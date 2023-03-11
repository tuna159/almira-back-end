import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeController } from './me.controller';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [MeController],
  providers: [MeService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class MeModule {}
