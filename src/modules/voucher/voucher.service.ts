import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from 'src/core/database/mysql/entity/voucher.entity';
import { EntityManager, Repository } from 'typeorm';

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
    return await voucherRepository.find();
  }
}
