import { Test, TestingModule } from '@nestjs/testing';
import { PostGiftService } from './post-gift.service';

describe('PostGiftService', () => {
  let service: PostGiftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostGiftService],
    }).compile();

    service = module.get<PostGiftService>(PostGiftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
