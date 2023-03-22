import { Test, TestingModule } from '@nestjs/testing';
import { PostReportingController } from './post-reporting.controller';
import { PostReportingService } from './post-reporting.service';

describe('PostReportingController', () => {
  let controller: PostReportingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostReportingController],
      providers: [PostReportingService],
    }).compile();

    controller = module.get<PostReportingController>(PostReportingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
