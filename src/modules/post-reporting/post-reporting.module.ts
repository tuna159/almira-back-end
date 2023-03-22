import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostReporting } from 'src/core/database/mysql/entity/postReporting.entity';
import { PostReportingService } from './post-reporting.service';

@Module({
  providers: [PostReportingService],
  imports: [TypeOrmModule.forFeature([PostReporting])],
  exports: [TypeOrmModule, PostReportingService],
})
export class PostReportingModule {}
