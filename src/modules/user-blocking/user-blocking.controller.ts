import { Controller } from '@nestjs/common';
import { UserBlockingService } from './user-blocking.service';

@Controller('user-blocking')
export class UserBlockingController {
  constructor(private readonly userBlockingService: UserBlockingService) {}
}
