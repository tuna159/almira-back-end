import { Controller } from '@nestjs/common';
import { PostCommentLikeService } from './post-comment-like.service';

@Controller('post-comment-like')
export class PostCommentLikeController {
  constructor(private readonly postCommentLikeService: PostCommentLikeService) {}
}
