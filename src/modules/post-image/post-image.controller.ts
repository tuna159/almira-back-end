import { Controller } from '@nestjs/common';
import { PostImageService } from './post-image.service';

@Controller('post-image')
export class PostImageController {
  constructor(private readonly postImageService: PostImageService) {}
}
