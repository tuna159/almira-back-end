import { Test, TestingModule } from '@nestjs/testing';
import { PostReportingService } from './post-reporting.service';

describe('PostReportingService', () => {
  let service: PostReportingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostReportingService],
    }).compile();

    service = module.get<PostReportingService>(PostReportingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
