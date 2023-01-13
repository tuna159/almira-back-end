import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { VLogin } from 'global/user/dto/login.dto';
import { VSignUp } from 'global/user/dto/signup.dto';
import { User } from 'src/database/entity/user.entity';
import { handleBCRYPTCompare, handleBCRYPTHash } from 'src/helper/utils';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    public jwtService: JwtService,
  ) {}

  async login(body: VLogin) {
    const user = await this.getUserByUserName(body.username);

    if (!user)
      throw new HttpException(
        ErrorMessage.USER_NAME_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );

    const password = await handleBCRYPTCompare(body.password, user.password);

    if (!password)
      throw new HttpException(
        ErrorMessage.PASSWORD_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );
    const payloadToken = {};

    const token = this.jwtService.sign(payloadToken, {
      secret: 'cmac56116c11a8s189a1s9c891a13cs',
      expiresIn: 100000,
    });
    return {
      user_id: user.user_id,
      token: token,
    };
  }

  async signup(body: VSignUp) {
    const payloadToken = {};

    const token = this.jwtService.sign(payloadToken, {
      secret: 'cmac56116c11a8s189a1s9c891a13cs',
      expiresIn: 100000,
    });

    const email = await this.getUserByEmail(body.email_address);

    const userName = await this.getUserByUserName(body.username);

    if (email) {
      throw new HttpException(
        ErrorMessage.GMAIL_ALREADY_EXITS,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userName) {
      throw new HttpException(
        ErrorMessage.USER_NAME_ALREADY_EXITS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const userParams = new User();
    userParams.email = body.email_address;
    userParams.phone_number = body.phone_number;
    userParams.user_name = body.username;
    userParams.password = await handleBCRYPTHash(body.password);
    userParams.token = token;

    await this.userRepository.save(userParams);

    return {
      user_id: userParams.user_id,
      token,
    };
  }

  async getUserByUserName(user_name: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      where: {
        user_name,
        is_deleted: EIsDelete.NOT_DELETE,
      },
    });
  }

  async getUserByEmail(email: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      where: {
        email,
        is_deleted: EIsDelete.NOT_DELETE,
      },
    });
  }
}
