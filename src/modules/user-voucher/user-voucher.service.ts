import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessage } from 'enum/error';
import { UserVoucher } from 'src/core/database/mysql/entity/userVoucher.entity';
import { EntityManager, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { VoucherService } from '../voucher/voucher.service';

@Injectable()
export class UserVoucherService {
  constructor(
    @InjectRepository(UserVoucher)
    private userVoucherRepository: Repository<UserVoucher>,
    private voucherService: VoucherService,
    private userService: UserService,
  ) {}

  async redeemVoucher(
    user_id: string,
    voucher_id: number,
    entityManager?: EntityManager,
  ) {
    const userVoucherRepository = entityManager
      ? entityManager.getRepository<UserVoucher>('user_voucher')
      : this.userVoucherRepository;

    const voucher = await this.voucherService.getOneVoucher(voucher_id);

    if (!voucher) {
      throw new HttpException(
        ErrorMessage.VOUCHER_DOES_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const userVoucherParam = new UserVoucher();
    userVoucherParam.user_id = user_id;
    userVoucherParam.voucher_id = voucher.voucher_id;
    userVoucherParam.points = voucher.point;

    const pointsOfUser = await this.userService.getUserByUserId(user_id);

    if (pointsOfUser.total_points < voucher.point) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_ENOUGH_POINTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userService.updateUser(
      user_id,
      { total_points: pointsOfUser.total_points - voucher.point },
      entityManager,
    );

    return;
  }
}
