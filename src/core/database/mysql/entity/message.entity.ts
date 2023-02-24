import { EIsDelete } from 'enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageImage } from './messageImage.entity';
import { User } from './user.entity';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn({
    name: 'message_id',
    type: 'int',
    unsigned: true,
  })
  message_id: number;

  @Column({ name: 'sender_id', type: 'char', length: 36, default: '' })
  sender_id: string;

  @Column({ name: 'receiver_id', type: 'char', length: 36, default: '' })
  receiver_id: string;

  @Column({ name: 'content', type: 'varchar', length: 4096, default: '' })
  content: string;

  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  is_read: number;

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
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @OneToMany(() => MessageImage, (messageImage) => messageImage.message)
  messageImages: MessageImage[];
}
