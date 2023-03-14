import {
  Controller,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UserData } from 'src/core/decorator/user.decorator';
import { IUserData } from 'src/core/interface/default.interface';
import { FollowingService } from './following.service';

@Controller('following')
export class FollowingController {
  constructor(private readonly followingService: FollowingService) {}
}
