import { Test, TestingModule } from '@nestjs/testing';
import { MessageImageController } from './message-image.controller';
import { MessageImageService } from './message-image.service';

describe('MessageImageController', () => {
  let controller: MessageImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageImageController],
      providers: [MessageImageService],
    }).compile();

    controller = module.get<MessageImageController>(MessageImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
