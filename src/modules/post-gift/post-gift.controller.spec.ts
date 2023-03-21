import { Test, TestingModule } from '@nestjs/testing';
import { PostGiftController } from './post-gift.controller';
import { PostGiftService } from './post-gift.service';

describe('PostGiftController', () => {
  let controller: PostGiftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostGiftController],
      providers: [PostGiftService],
    }).compile();

    controller = module.get<PostGiftController>(PostGiftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
