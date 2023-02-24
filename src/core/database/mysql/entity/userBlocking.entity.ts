import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Unique(['blocked_on_id', 'blocked_by_id'])
@Entity('user_blocking')
export class UserBlocking {
  @PrimaryGeneratedColumn({
    name: 'user_blocking_id',
    type: 'int',
    unsigned: true,
  })
  user_blocking_id: number;

  @Column({
    name: 'blocked_on_id',
    type: 'char',
    length: 36,
  })
  blocked_on_id: string;

  @Column({
    name: 'blocked_by_id',
    type: 'char',
    length: 36,
  })
  blocked_by_id: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'current_timestamp',
  })
  created_at: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: null,
    onUpdate: 'current_timestamp',
  })
  updated_at: Date | null;

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'blocked_on_id' })
  userOnBlocks: User;

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'blocked_by_id' })
  userByBlocks: User;
}
