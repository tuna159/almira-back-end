import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('gift_type')
export class Gift {
  @PrimaryGeneratedColumn({ name: 'gift_id', type: 'int', unsigned: true })
  gift_id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'gift_image', type: 'varchar', length: 300 })
  gift_image: string;

  @Column({ name: 'gift_point', type: 'int' })
  point: number;
}
