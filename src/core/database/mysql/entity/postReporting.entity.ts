import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('post_reporting')
export class PostReporting {
  @PrimaryGeneratedColumn({
    name: 'post_reporting_id',
    type: 'int',
    unsigned: true,
  })
  post_reporting_id: number;

  @Column({ name: 'post_id', type: 'int', default: null })
  post_id: number;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  user_id: string;

  @Column({
    name: 'reason_message',
    type: 'varchar',
    length: 1000,
  })
  reason_message: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'current_timestamp',
  })
  created_at: Date;
}
