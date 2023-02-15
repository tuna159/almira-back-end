import { forwardRef, Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AuthService } from './auth.service';
import { UserModule } from 'src/modules/user/user.module';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [forwardRef(() => UserModule), PassportModule, JwtModule],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
