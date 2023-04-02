import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ECommonStatus, EIsDelete } from 'enum';
import {
  ELastMessageEmpty,
  EMessageWho,
  EReadMessageStatus,
} from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { VSendMessage } from 'global/message/dto/send-messages';
import { Message } from 'src/core/database/mysql/entity/message.entity';
import { MessageImage } from 'src/core/database/mysql/entity/messageImage.entity';
import {
  IPaginationQuery,
  IUserData,
} from 'src/core/interface/default.interface';
import { Repository, Connection, DeepPartial, EntityManager } from 'typeorm';
import { getManager } from 'typeorm/globals';
import { MessageImageService } from '../message-image/message-image.service';
import { UserService } from '../user/user.service';
import moment = require('moment');

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
      .addSelect(['senderDetail.image_url'])
      .addSelect(['receiver.user_id'])
      .addSelect(['receiverDetail.image_url'])
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
      .orderBy('message.created_at', 'ASC')
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
    if (!body?.content && !body?.image_url) {
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
      if (body?.image_url) {
        const messageImageParam = new MessageImage();
        messageImageParam.message_id = message.message_id;
        messageImageParam.image_url = body.image_url;

        messageImageParams.push(messageImageParam);
      }

      await this.messageImageService.bulkcreateMessageImage(
        messageImageParams,
        manager,
      );

      return message;
    });

    return {
      message_id: message.message_id,
      images: body.image_url,
    };
  }

  async getMessages(userData: IUserData) {
    return await this.getLastMessageByUserId(userData);
  }

  async getLastMessageByUserId(userData: IUserData, is_archives = false) {
    const manager = getManager();
    const searchQuery = is_archives ? 'IN' : 'NOT IN';

    const query_select_conversation = `
            SELECT
                t1.*,
                uSender.is_deleted as isDeletedSender,
                uReceiver.is_deleted as isDeletedReceiver,
                uSender.user_name as userNameSender, uReceiver.user_name as userNameReceiver,
                udSender.image_url as image_urludSender, udReceiver.image_url as image_urludReceiver
            FROM message AS t1
            LEFT JOIN user uSender
                ON uSender.user_id = t1.sender_id
            LEFT JOIN user uReceiver
                ON uReceiver.user_id = t1.receiver_id
            LEFT JOIN user_detail udSender
                ON udSender.user_id = t1.sender_id
            LEFT JOIN user_detail udReceiver
                ON udReceiver.user_id = t1.receiver_id
            INNER JOIN(
                SELECT
                    LEAST(sender_id, receiver_id) AS sender_id,
                    GREATEST(sender_id, receiver_id) AS receiver_id,
                    MAX(message_id) AS max_id
                FROM message
                WHERE is_deleted = ${EIsDelete.NOT_DELETE}
                GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
            ) AS t2
                ON
                    LEAST(t1.sender_id, t1.receiver_id) = t2.sender_id AND
                    GREATEST(t1.sender_id, t1.receiver_id) = t2.receiver_id AND
                    t1.message_id = t2.max_id
            WHERE
              (t1.sender_id = ? AND t1.receiver_id) OR
              (t1.receiver_id = ? AND t1.sender_id)
                  ORDER BY message_id DESC`;
    const query_count_unread_message = `
            SELECT
                sender_id, count(sender_id) unread
            FROM message
            WHERE
                is_read = ${EReadMessageStatus.UN_READ}
                AND is_deleted = ${EIsDelete.NOT_DELETE}
                AND receiver_id = ?
                AND sender_id != receiver_id
            GROUP BY sender_id`;

    const [conversation, unread_message] = await Promise.all([
      manager.query(query_select_conversation, [
        userData.user_id,
        userData.user_id,
      ]),
      manager.query(query_count_unread_message, [userData.user_id]),
    ]);

    const data = conversation.map((e) => {
      const user_id =
        userData.user_id === e.sender_id ? e.receiver_id : e.sender_id;
      let unread = 0;
      for (let i = 0; i < unread_message.length; i++) {
        const u = unread_message[i];
        if (u.sender_id === user_id) {
          unread = parseInt(u.unread);
          break;
        }
      }

      const type =
        userData.user_id === e.sender_id
          ? EMessageWho.SENT
          : EMessageWho.Received;

      let messageEmpty = null;

      if (type === EMessageWho.SENT) {
        messageEmpty = ELastMessageEmpty.SENT;
      } else {
        messageEmpty = ELastMessageEmpty.RECEIVED;
      }

      const last_message = e.content ? e.content : messageEmpty;

      const is_deleted =
        userData.user_id === e.sender_id
          ? !!e.isDeletedReceiver
          : !!e.isDeletedSender;

      return {
        type: type,
        user_id: user_id,
        user_name: is_deleted
          ? null
          : userData.user_id === e.sender_id
          ? e.userNameReceiver
          : e.userNameSender,
        user_image: {
          image_url: is_deleted
            ? null
            : userData.user_id === e.sender_id
            ? e.image_urludReceiver
            : e.image_urludSender,
        },
        last_message: last_message,
        unread_message_count: unread,
        is_deleted: is_deleted,
        created: moment(JSON.stringify(e?.created_at), 'YYYY-MM-DD').format(
          'YYYY-MM-DD',
        ),
      };
    });

    return data.sort((a, b) => (a.created < b.created ? 1 : -1));
  }
}
