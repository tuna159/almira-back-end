import { Controller } from '@nestjs/common';
import { PostReportingService } from './post-reporting.service';

@Controller('post-reporting')
export class PostReportingController {
  constructor(private readonly postReportingService: PostReportingService) {}
}
