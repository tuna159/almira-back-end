import { Test, TestingModule } from '@nestjs/testing';
import { MessageImageService } from './message-image.service';

describe('MessageImageService', () => {
  let service: MessageImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageImageService],
    }).compile();

    service = module.get<MessageImageService>(MessageImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
