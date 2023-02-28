import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { VLogin } from 'global/user/dto/login.dto';
import { VSignUp } from 'global/user/dto/signup.dto';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { AuthService } from 'src/core/global/auth/auth.service';
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
      relations: ['userDetail'],
    });
  }
}
