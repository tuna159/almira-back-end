import { Controller } from '@nestjs/common';
import { MessageImageService } from './message-image.service';

@Controller('message-image')
export class MessageImageController {
  constructor(private readonly messageImageService: MessageImageService) {}
}
