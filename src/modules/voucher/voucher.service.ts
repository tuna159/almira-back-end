import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from 'src/core/database/mysql/entity/voucher.entity';
import {
  EntityManager,
  LessThanOrEqual,
  Repository,
  MoreThanOrEqual,
} from 'typeorm';
import moment = require('moment');
import { IUserData } from 'src/core/interface/default.interface';
import { VCreateVoucher } from 'global/user/dto/voucher.dto';
import { ErrorMessage } from 'enum/error';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
  ) {}

  async getVoucher(entityManager?: EntityManager) {
    const voucherRepository = entityManager
      ? entityManager.getRepository<Voucher>('voucher')
      : this.voucherRepository;
    const voucher = await voucherRepository.find({
      where: {
        start_time: LessThanOrEqual(new Date()),
        expired_time: MoreThanOrEqual(new Date()),
      },
    });
    const data = voucher.map((e) => {
      return {
        voucher_id: e.voucher_id,
        voucher_name: e.voucher_name,
        code: e.code,
        voucher_expiration_time: moment(e.expired_time).diff(moment(), 'hours'),
      };
    });
    return data;
  }

  async getOneVoucher(voucher_id: number, entityManager?: EntityManager) {
    const voucherRepository = entityManager
      ? entityManager.getRepository<Voucher>('voucher')
      : this.voucherRepository;
    return await voucherRepository.findOne({
      where: { voucher_id: voucher_id },
    });
  }

  async getOneVoucherByName(
    voucher_name: string,
    entityManager?: EntityManager,
  ) {
    const voucherRepository = entityManager
      ? entityManager.getRepository<Voucher>('voucher')
      : this.voucherRepository;
    return await voucherRepository.findOne({
      where: { voucher_name: voucher_name },
    });
  }

  async getCurrentVoucher() {
    return await this.voucherRepository.findOne({
      where: {
        expired_time: LessThanOrEqual(new Date()),
      },
    });
  }

  async createVoucher(
    userData: IUserData,
    body: VCreateVoucher,
    entityManager?: EntityManager,
  ) {
    const voucherRepository = entityManager
      ? entityManager.getRepository<Voucher>('voucher')
      : this.voucherRepository;

    const voucher = this.getOneVoucherByName(body.voucher_name);

    if (!voucher) {
      throw new HttpException(
        ErrorMessage.INVALID_PARAM,
        HttpStatus.BAD_REQUEST,
      );
    }

    const generateRandomString = (myLength) => {
      const chars =
        'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
      const randomArray = Array.from(
        { length: myLength },
        (v, k) => chars[Math.floor(Math.random() * chars.length)],
      );

      const randomString = randomArray.join('');
      return randomString;
    };

    const voucherParam = new Voucher();
    voucherParam.voucher_name = body.voucher_name;
    voucherParam.point = body.point;
    voucherParam.start_time = new Date(body?.start_time);
    voucherParam.expired_time = new Date(body?.expired_time);
    voucherParam.code = generateRandomString(5);

    await this.voucherRepository.save(voucherParam);
    return null;
  }
}
