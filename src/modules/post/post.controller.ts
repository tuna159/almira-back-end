import { Controller, Get } from '@nestjs/common';
import { UserData } from 'src/core/decorator/user.decorator';
import { IUserData } from 'src/core/interface/default.interface';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPosts(@UserData() userData: IUserData) {
    console.log(userData, 111111);

    return await this.postService.getPosts(userData);
  }
}
