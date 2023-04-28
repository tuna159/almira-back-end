import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { ResponseInterceptor } from './helper/response.interceptor';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './helper/http-exception.filter';
import { LoggerMiddleware } from './helper/logger.middleware';
import { PostModule } from './modules/post/post.module';
import { JwtAuthGuard } from './core/global/auth/guard/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { PostImageModule } from './modules/post-image/post-image.module';
import { PostCommentModule } from './modules/post-comment/post-comment.module';
import { ActivityModule } from './modules/activity/activity.module';
import { PostLikeModule } from './modules/post-like/post-like.module';
import { UserDetailModule } from './modules/user-detail/user-detail.module';
import { MeModule } from './modules/me/me.module';
import { FollowingModule } from './modules/follow/follow.module';
import { MessageModule } from './modules/message/message.module';
import { MessageImageModule } from './modules/message-image/message-image.module';
import { UserBlockingModule } from './modules/user-blocking/user-blocking.module';
import { GiftModule } from './modules/gift/gift.module';
import { PostCommentLikeModule } from './modules/post-comment-like/post-comment-like.module';
import { PostGiftModule } from './modules/post-gift/post-gift.module';
import { VoucherModule } from './modules/voucher/voucher.module';
import { UserVoucherModule } from './modules/user-voucher/user-voucher.module';
import { PostReportingModule } from './modules/post-reporting/post-reporting.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      // imports: [ConfigModule],
      // inject: [ConfigService],
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_MYSQL_HOST,
        port: process.env.DB_MYSQL_PORT,
        username: process.env.DB_MYSQL_USER,
        password: process.env.DB_MYSQL_PASSWORD,
        database: process.env.DB_MYSQL_NAME,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
        logging: false,
        // logger: new DatabaseMysqlLogger(),
        timezone: '+07:00',
        legacySpatialSupport: false, //fix version mysql 8
      }),
    }),
    UserModule,
    PostModule,
    PostImageModule,
    PostCommentModule,
    ActivityModule,
    PostLikeModule,
    UserDetailModule,
    MeModule,
    FollowingModule,
    MessageModule,
    MessageImageModule,
    UserBlockingModule,
    GiftModule,
    PostCommentLikeModule,
    PostGiftModule,
    VoucherModule,
    UserVoucherModule,
    PostReportingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
