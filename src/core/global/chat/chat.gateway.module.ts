import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from 'src/modules/message/message.module';
import { UserModule } from 'src/modules/user/user.module';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [ChatGateway, JwtStrategy],
  imports: [forwardRef(() => MessageModule), UserModule, JwtModule],
  exports: [ChatGateway],
})
export class ChatGatewayModule {}
