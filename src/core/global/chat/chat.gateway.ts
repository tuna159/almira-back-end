import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VSendMessage } from 'global/message/dto/send-messages';
import { MessageService } from 'src/modules/message/message.service';
import { IUserData } from 'src/core/interface/default.interface';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly messageService: MessageService) {}

  @WebSocketServer() server: Server;

  async handleConnection(userData: IUserData, socket: Socket): Promise<void> {
    // Khi một client kết nối đến server
    console.log(`Client connected: ${socket.id}`);
    const userId = socket.handshake.query.userId as string;
    console.log(`Client connected: ${userId}`);

    // Gửi danh sách tin nhắn cho client
    const messageList = await this.messageService.getMessageListByUserId(
      userData,
      userId,
    );
    socket.emit('messageList', messageList);
  }

  handleDisconnect(socket: Socket): void {
    // Khi một client ngắt kết nối từ server
    console.log(`Client disconnected`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    userData: IUserData,
    socket: Socket,
    messageDto: VSendMessage,
  ): Promise<void> {
    // Khi server nhận được một tin nhắn mới từ client
    console.log(`Received message: ${JSON.stringify(messageDto)}`);

    // Lưu tin nhắn vào database
    await this.messageService.sendMessages(userData, messageDto);

    // Gửi tin nhắn cho tất cả các client khác
    socket.broadcast.emit('newMessage', messageDto);
  }
}
