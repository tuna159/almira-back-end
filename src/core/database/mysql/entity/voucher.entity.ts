import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('voucher')
export class Voucher {
  @PrimaryGeneratedColumn({ name: 'voucher_id', type: 'int', unsigned: true })
  voucher_id: number;

  @Column({ name: 'voucher_name', type: 'varchar', length: 100 })
  voucher_name: string;

  @Column({ name: 'code', type: 'varchar', length: 100 })
  code: string;

  @Column({ name: 'start_time', type: 'timestamp' })
  start_time: Date;

  @Column({ name: 'expired_time', type: 'timestamp' })
  expired_time: Date;

  @Column({ name: 'point', type: 'int' })
  point: number;
}
