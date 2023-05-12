import { Inject, forwardRef } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { VSendMessage } from 'global/message/dto/send-messages';
import { Server, Socket } from 'socket.io';
import { UserData } from 'src/core/decorator/user.decorator';
import { IUserData } from 'src/core/interface/default.interface';
import { MessageService } from 'src/modules/message/message.service';

@WebSocketGateway({ namespace: '/api/v1' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
  ) {}

  @WebSocketServer() server: Server;

  async handleConnection(socket: Socket): Promise<void> {
    // Khi một client kết nối đến server
    console.log(`Client connected: ${socket.id}`);

    // Gửi danh sách tin nhắn cho client
    // const messageList = await this.messageService.getMessageListByUserId(
    //   userId,
    // );
    // socket.emit('messageList', messageList);
  }

  handleDisconnect(socket: Socket): void {
    // Khi một client ngắt kết nối từ server
    console.log(`Client disconnected`);
  }

  @SubscribeMessage('get_message_list')
  async handleGetMessageList(
    @MessageBody() data: { auth: string; user_id: string },
  ) {
    const result = await this.messageService.getMessageListByUserId(
      data.auth,
      data.user_id,
    );

    console.log(data);

    // Emit kết quả tới tất cả các client đang kết nối tới server
    this.server.emit('message_list', result);
  }

  @SubscribeMessage('send_message')
  onNewMessage(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    console.log(body);
    this.server.emit('message_list', {
      msg: 'new Mewssage',
      content: body,
    });
  }

  // @SubscribeMessage('send_message')
  // async handleSendMessage(
  //   @ConnectedSocket() client: Socket,
  //   // @UserData() userData: IUserData,
  //   // @MessageBody() body: VSendMessage,
  //   @MessageBody() data: { auth: string; body: VSendMessage },
  // ) {
  //   console.log(1111);

  //   // const result = await this.messageService.sendMessages(
  //   //   userData.user_id,
  //   //   body,
  //   // );
  //   const result = await this.messageService.sendMessages(
  //     '0fb88f7d-f718-4452-80d1-0cc87a8c8584',
  //     {
  //       user_id: '16d2d0be-607b-4a4c-92d4-c862ed046898',
  //       content: 'aaaa',
  //       image_url:
  //         'https://fiika-dev.s3.ap-northeast-1.amazonaws.com/post/1677579562348-7f8843426cdf55470e02cd722cc894d2',
  //     },
  //   );

  //   client.emit('send_message', result);
  // }
}
