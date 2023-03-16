import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ECommonStatus, EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { VSendMessage } from 'global/message/dto/send-messages';
import { Message } from 'src/core/database/mysql/entity/message.entity';
import { MessageImage } from 'src/core/database/mysql/entity/messageImage.entity';
import {
  IPaginationQuery,
  IUserData,
} from 'src/core/interface/default.interface';
import { Repository, Connection, DeepPartial, EntityManager } from 'typeorm';
import { MessageImageService } from '../message-image/message-image.service';
import { UserService } from '../user/user.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private userService: UserService,
    private connection: Connection,
    private messageImageService: MessageImageService,
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

  async createNewMessage(
    value: DeepPartial<Message>,
    entityManager?: EntityManager,
  ) {
    const messageRepository = entityManager
      ? entityManager.getRepository<Message>('message')
      : this.messageRepository;
    return await messageRepository.save(value);
  }

  async sendMessages(userData: IUserData, body: VSendMessage) {
    if (!body?.content && !body?.images?.length) {
      throw new HttpException(
        ErrorMessage.INVALID_PARAM,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userData.user_id === body?.user_id) {
      throw new HttpException(
        ErrorMessage.CANNOT_SEND_TO_MYSELF,
        HttpStatus.BAD_REQUEST,
      );
    }

    const receiver = await this.userService.getUserByUserId(body?.user_id);

    if (!receiver) {
      throw new HttpException(
        ErrorMessage.RECEIVER_DOES_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const message = await this.connection.transaction(async (manager) => {
      const messageParams = new Message();
      messageParams.sender_id = userData.user_id;
      messageParams.receiver_id = body?.user_id;
      messageParams.content = body?.content ? body?.content : '';

      const message = await this.createNewMessage(messageParams, manager);

      const messageImageParams = [];
      if (body?.images && body?.images?.length) {
        body.images.forEach((image) => {
          const messageImageParam = new MessageImage();
          messageImageParam.message_id = message.message_id;
          messageImageParam.image_url = image.image_url;

          messageImageParams.push(messageImageParam);
        });
      }

      await this.messageImageService.bulkcreateMessageImage(
        messageImageParams,
        manager,
      );

      return message;
    });

    return {
      message_id: message.message_id,
      images: body.images,
    };
  }
}
