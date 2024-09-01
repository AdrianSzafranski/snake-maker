import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule} from './post/post.module'
import { AuthModule } from './auth/auth.module';
import { UserModule } from './auth/user/user.module';
import { APP_FILTER } from '@nestjs/core';
import { ValidationExceptionFilter } from './common/utils/validation.utils';
import { GameMapModule } from './game-map/game-map.module';
import { UserScoreModule } from './user-score/user-score.module';
import { PostCommentModule } from './post/comment/post-comment.module';
@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [__dirname + '/../**/*.entity.js'],
    synchronize: true
  }),
  PostModule,
  PostCommentModule,
  AuthModule,
  GameMapModule,
  UserScoreModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
  ],
})
export class AppModule {}
