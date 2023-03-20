import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentLikeService } from './post-comment-like.service';

describe('PostCommentLikeService', () => {
  let service: PostCommentLikeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostCommentLikeService],
    }).compile();

    service = module.get<PostCommentLikeService>(PostCommentLikeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
