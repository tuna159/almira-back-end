// import { EIsDelete } from 'enum';
// import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// @Entity('user_point')
// export class UserPoint {
//   @PrimaryGeneratedColumn({
//     name: 'user_point_id',
//     type: 'int',
//     unsigned: true,
//   })
//   user_point_id: number;

//   @Column({ name: 'sender_id', type: 'char', length: 36 })
//   sender_id: string;

//   @Column({ name: 'receiver_id', type: 'char', length: 36 })
//   receiver_id: string;

//   @Column({ name: 'points', type: 'int', default: 0 })
//   points: number;

//   @Column({ name: 'gift_id', unsigned: true, type: 'int', default: null })
//   gift_id: number;

//   @Column({ name: 'post_id', type: 'int', default: null })
//   post_id: number;

//   @Column({ name: 'post_comment_id', type: 'int', default: null })
//   post_comment_id: number;

//   @Column({
//     name: 'is_deleted',
//     type: 'tinyint',
//     width: 1,
//     comment: '0: not deleted, 1: deteled',
//     default: EIsDelete.NOT_DELETE,
//   })
//   is_deleted: number;

//   @Column({ name: 'created_by', type: 'varchar', length: 255, default: null })
//   created_by: string;

//   @Column({ name: 'updated_by', type: 'varchar', length: 255, default: null })
//   updated_by: string;

//   @Column({
//     name: 'created_at',
//     type: 'timestamp',
//     default: () => 'current_timestamp',
//   })
//   created_at: Date;

//   @Column({
//     name: 'updated_at',
//     type: 'timestamp',
//     default: null,
//     onUpdate: 'current_timestamp',
//   })
//   updated_at: Date | null;
// }
