import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Voucher } from './voucher.entity';

@Entity('user_voucher')
export class UserVoucher {
  @PrimaryGeneratedColumn({
    name: 'user_voucher_id',
    type: 'int',
    unsigned: true,
  })
  user_voucher_id: number;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  user_id: string;

  @Column({ name: 'voucher_id', type: 'int', unsigned: true })
  voucher_id: number;

  @Column({ name: 'points', type: 'int', default: 0 })
  points: number;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'current_timestamp',
  })
  created_at: Date;

  @ManyToOne(() => Voucher, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'voucher_id' })
  voucherId: Voucher;

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  userId: User;
}
