import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { EIsDelete } from 'enum';
import { VAddComment } from 'global/post/dto/addComment.dto';
import { VCreatePost } from 'global/post/dto/createPost.dto';
import { UserData } from 'src/core/decorator/user.decorator';
import { IUserData } from 'src/core/interface/default.interface';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPosts(@UserData() userData: IUserData) {
    return await this.postService.getPosts(userData);
  }

  @Post('')
  async createPost(@UserData() userData: IUserData, @Body() body: VCreatePost) {
    return this.postService.createPost(userData, body);
  }

  @Post('/:post_id/comments')
  async handleAddComment(
    @UserData() userData: IUserData,
    @Body() body: VAddComment,
    @Param(
      'post_id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    post_id: number,
  ) {
    return await this.postService.createComment(userData, post_id, body);
  }

  @Post('/:post_id/likes')
  async handleAddPostLike(
    @UserData() userData: IUserData,
    @Param(
      'post_id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    post_id: number,
  ) {
    return await this.postService.createPostLike(userData, post_id);
  }

  @Delete(':post_id')
  async deletePost(
    @UserData() userData: IUserData,
    @Param(
      'post_id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    post_id: number,
  ) {
    return await this.postService.handleDeletePost(post_id, userData.user_id, {
      is_deleted: EIsDelete.DELETED,
    });
  }
}
