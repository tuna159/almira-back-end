import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
  Delete,
  Put,
} from '@nestjs/common';
import { EIsDelete } from 'enum';
import { VAddComment } from 'global/post/dto/addComment.dto';
import { VCreatePost } from 'global/post/dto/createPost.dto';
import { VReportPostDto } from 'global/post/dto/report-post.dto';
import { VSendGift } from 'global/post/dto/sendGift.dto';
import { VUpdatePost } from 'global/post/dto/updatePost.dto';
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

  @Delete('/:post_id/likes')
  async unlikePost(
    @UserData() userData: IUserData,
    @Param(
      'post_id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    post_id: number,
  ) {
    return await this.postService.deleteLikePost(userData, post_id);
  }

  @Get('/:post_id/comments')
  async handleGetPostDetail(
    @UserData() userData: IUserData,
    @Param(
      'post_id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    post_id: number,
  ) {
    return await this.postService.getPostComment(post_id, userData.user_id);
  }
  @Put('/:post_id')
  async handleUpdatePost(
    @UserData() userData: IUserData,
    @Body() body: VUpdatePost,
    @Param(
      'post_id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    post_id: number,
  ) {
    return await this.postService.handleUpdatePost(
      post_id,
      userData.user_id,
      body,
    );
  }

  @Post('/:post_id/comments/:post_comment_id/likes')
  async likePostComment(
    @UserData() userData: IUserData,
    @Param(
      'post_id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    post_id: number,
    @Param(
      'post_comment_id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    post_comment_id: number,
  ) {
    return await this.postService.handlePostCommentLikes(
      userData,
      post_id,
      post_comment_id,
    );
  }

  @Post('/:post_id/sendGift')
  async sendGiftPost(
    @UserData() userData: IUserData,
    @Param(
      'post_id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    post_id: number,
    @Body() body: VSendGift,
  ) {
    return await this.postService.sendGiftPost(userData, post_id, body);
  }

  @Post('/:post_id/reports')
  async reportPost(
    @UserData() userData: IUserData,
    @Body() body: VReportPostDto,
    @Param(
      'post_id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    post_id: number,
  ) {
    return await this.postService.handleReportPost(userData, post_id, body);
  }
}
