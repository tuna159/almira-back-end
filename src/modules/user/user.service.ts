import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { VLogin } from 'global/user/dto/login.dto';
import { VSignUp } from 'global/user/dto/signup.dto';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { AuthService } from 'src/core/global/auth/auth.service';
import {
  IPaginationQuery,
  IUserData,
} from 'src/core/interface/default.interface';
import { returnPostsImage } from 'src/helper/utils';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async signup(body: VSignUp) {
    return await this.authService.signup(body);
  }

  async login(body: VLogin) {
    return await this.authService.login(body);
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

  async getUser(entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.find();
  }

  async getUserByUserId(userId: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('m_user')
      : this.userRepository;
    return await userRepository.findOne({
      where: {
        user_id: userId,
        is_deleted: EIsDelete.NOT_DELETE,
      },
    });
  }

  async createUser(body: DeepPartial<User>, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;

    return await userRepository.save(body);
  }

  async updateUser(
    user_id: string,
    body: DeepPartial<User>,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.update({ user_id }, body);
  }

  async findUserByUserId(userId: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      where: {
        user_id: userId,
        is_deleted: EIsDelete.NOT_DELETE,
      },
      relations: ['userDetail', 'posts'],
    });
  }

  async getUserName(
    userData: IUserData,
    query: IPaginationQuery,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    let data = [];

    const queryBuilder = userRepository
      .createQueryBuilder('user')
      .select()
      .leftJoinAndSelect('user.userDetail', 'userDetail')
      .where('user.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETE,
      });

    if (query.search_key && query.search_key != '') {
      const searchKey = query.search_key.trim().toLowerCase();
      queryBuilder.andWhere('((LOWER(user.user_name) LIKE :searchKey))', {
        searchKey: `%${searchKey}%`,
      });
    }
    const [listUser] = await queryBuilder.getManyAndCount();
    data = listUser.map((user) => {
      return {
        user_name: user.user_name,
        image_url: user.userDetail.image_url,
      };
    });

    return data;
  }

  async getUserDetail(userData: IUserData, targetUserId: string) {
    const user = await this.findUserByUserId(targetUserId);

    if (!user) {
      throw new HttpException(
        ErrorMessage.USER_DOES_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const image = user.posts.map((post) => returnPostsImage(post));

    const data = {
      user_id: user?.user_id,
      user_name: user?.user_name,
      avatar: user?.userDetail?.image_url,
      introduction: user?.userDetail?.introduction,
      post_count: user.posts.length,
      image: image,
    };
    return data;
  }

  async getToken(userData: IUserData) {
    return await this.authService.getToken(userData);
  }
}
