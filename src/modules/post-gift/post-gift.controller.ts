import { Controller } from '@nestjs/common';
import { PostGiftService } from './post-gift.service';

@Controller('post-gift')
export class PostGiftController {
  constructor(private readonly postGiftService: PostGiftService) {}
}
