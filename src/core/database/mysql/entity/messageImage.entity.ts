import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Message } from './message.entity';

@Unique(['message_id', 'sequence_no'])
@Entity('message_image')
export class MessageImage {
  @PrimaryGeneratedColumn({
    name: 'message_image_id',
    type: 'int',
    unsigned: true,
  })
  message_image_id: number;

  @Column({ name: 'message_id', type: 'int', unsigned: true })
  message_id: number;

  @Column({ name: 'sequence_no', type: 'int', default: 1 })
  sequence_no: number;

  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 512,
    default: null,
    nullable: true,
  })
  image_url: string | null;

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

  @ManyToOne(() => Message, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;
}
