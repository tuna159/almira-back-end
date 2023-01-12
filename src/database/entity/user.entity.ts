import { EIsDelete } from 'enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  user_id: string;

  @Column({ name: 'user_name', type: 'varchar', length: 255, default: null })
  user_name: string;

  @Column({ name: 'password', type: 'varchar', length: 255, default: null })
  password: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 65, default: null })
  phone_number: string;

  @Column({ name: 'email', type: 'varchar', length: 255, default: null })
  email: string;

  @Column({ name: 'token', type: 'mediumtext', nullable: true })
  token: string | null;

  @Column({
    name: 'is_deleted',
    type: 'tinyint',
    width: 1,
    comment: '0: not deleted, 1: deteled',
    default: EIsDelete.NOT_DELETE,
  })
  is_deleted: number;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'current_timestamp',
  })
  created_at: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    default: null,
  })
  updated_at: Date | null;
}
