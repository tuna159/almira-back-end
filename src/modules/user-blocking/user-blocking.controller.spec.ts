import { Test, TestingModule } from '@nestjs/testing';
import { UserBlockingController } from './user-blocking.controller';
import { UserBlockingService } from './user-blocking.service';

describe('UserBlockingController', () => {
  let controller: UserBlockingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserBlockingController],
      providers: [UserBlockingService],
    }).compile();

    controller = module.get<UserBlockingController>(UserBlockingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
