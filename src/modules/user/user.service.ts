import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { VLogin } from 'global/user/dto/login.dto';
import { VSignUp } from 'global/user/dto/signup.dto';
import { User } from 'src/database/entity/user.entity';
import { handleBCRYPTHash } from 'src/helper/utils';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    public jwtService: JwtService,
  ) {}

  async login(body: VLogin) {
    return body;
  }

  async signup(body: VSignUp) {
    const payloadToken = {};

    const token = this.jwtService.sign(payloadToken, {
      secret: 'cmac56116c11a8s189a1s9c891a13cs',
      expiresIn: 100000,
    });

    const userParams = new User();
    userParams.email = body.email_address;
    userParams.phone_number = body.phone_number;
    userParams.user_name = body.username;
    userParams.password = await handleBCRYPTHash(body.password);
    userParams.token = token;

    await this.userRepository.save(userParams);

    return {
      token,
      user_id: userParams.user_id,
    };
  }
}
