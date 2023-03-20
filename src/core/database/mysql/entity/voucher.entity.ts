import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('voucher')
export class Voucher {
  @PrimaryGeneratedColumn({ name: 'voucher_id', type: 'int', unsigned: true })
  voucher_id: number;

  @Column({ name: 'code', type: 'varchar', length: 100 })
  code: string;

  @Column({ name: 'expired_time', type: 'varchar', length: 300 })
  expired_time: string;

  @Column({ name: 'point', type: 'int' })
  point: number;
}
