import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ECommonStatus, EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { Message } from 'src/core/database/mysql/entity/message.entity';
import {
  IPaginationQuery,
  IUserData,
} from 'src/core/interface/default.interface';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private userService: UserService,
  ) {}

  async getMessageListByUserId(
    userData: IUserData,
    target_user_id: string,
    query: IPaginationQuery,
  ) {
    if (userData.user_id === target_user_id) {
      throw new HttpException(
        ErrorMessage.CANNOT_GET_TO_MYSELF,
        HttpStatus.BAD_REQUEST,
      );
    }

    const targetUser = await this.userService.findUserByUserId(target_user_id);

    if (!targetUser) {
      throw new HttpException(
        ErrorMessage.USER_DOES_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const sqlMessage = this.messageRepository
      .createQueryBuilder('message')
      .select()
      .addSelect(['sender.user_id'])
      .addSelect(['senderDetail.image_url', 'senderDetail.thumbnail_url'])
      .addSelect(['receiver.user_id'])
      .addSelect(['receiverDetail.image_url', 'receiverDetail.thumbnail_url'])
      .addSelect(['messageImages'])
      .leftJoin('message.sender', 'sender')
      .leftJoin('sender.userDetail', 'senderDetail')
      .leftJoin('message.receiver', 'receiver')
      .leftJoin('receiver.userDetail', 'receiverDetail')
      .leftJoin('message.messageImages', 'messageImages')
      .where(
        `((message.sender_id = :user_id AND message.receiver_id = :target_user_id) OR
          (message.sender_id = :target_user_id AND message.receiver_id = :user_id))`,
        {
          user_id: userData.user_id,
          target_user_id,
        },
      )
      .andWhere('message.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETE,
      });

    sqlMessage
      .orderBy('message.created_at', 'DESC')
      .skip(query.skip)
      .take(query.limit);

    const [message, totalItems] = await sqlMessage.getManyAndCount();

    const data = message.map((e) => {
      return {
        message_id: e.message_id,
        content: e.content,
        images: e.messageImages
          .map((e) => {
            return {
              image_url: e.image_url,
              thumbnail_url: e.thumbnail_url,
              sequence_no: e.sequence_no,
            };
          })
          .sort((a, b) => a.sequence_no - b.sequence_no),
        is_sent: userData.user_id === e.sender_id ? true : false,
        created: e.created_at,
      };
    });

    const is_last_page =
      query.page < Math.ceil(totalItems / query.limit)
        ? !!ECommonStatus.NO
        : !!ECommonStatus.YES;

    const is_deleted =
      targetUser.is_deleted == EIsDelete.NOT_DELETE ? false : true;

    return {
      user_data: {
        user_id: targetUser.user_id,
        user_name: targetUser.user_name,
        user_image: {
          image_url:
            targetUser.userDetail && !is_deleted
              ? targetUser.userDetail.image_url
              : null,
          thumbnail_url:
            targetUser.userDetail && !is_deleted
              ? targetUser.userDetail.thumbnail_url
              : null,
        },
        is_deleted: is_deleted,
      },
      message_data: data,
      is_last_page: is_last_page,
    };
  }
}
