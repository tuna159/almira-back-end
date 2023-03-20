import { Test, TestingModule } from '@nestjs/testing';
import { UserBlockingService } from './user-blocking.service';

describe('UserBlockingService', () => {
  let service: UserBlockingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserBlockingService],
    }).compile();

    service = module.get<UserBlockingService>(UserBlockingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
