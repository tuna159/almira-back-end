import { Controller } from '@nestjs/common';
import { PostCommentService } from './post-comment.service';

@Controller('post-comment')
export class PostCommentController {
  constructor(private readonly postCommentService: PostCommentService) {}
}
