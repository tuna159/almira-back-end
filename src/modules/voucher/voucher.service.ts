import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from 'src/core/database/mysql/entity/voucher.entity';
import {
  EntityManager,
  LessThanOrEqual,
  Repository,
  MoreThanOrEqual,
} from 'typeorm';
import moment = require('moment');

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

  async getCurrentVoucher() {
    return await this.voucherRepository.findOne({
      where: {
        expired_time: LessThanOrEqual(new Date()),
      },
    });
  }
}
