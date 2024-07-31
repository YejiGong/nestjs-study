import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { POST_IMAGE_PATH, POSTS_FOLDER_NAME } from 'src/common/const/path.const';
import { ImageModel } from 'src/common/entities/image.entity';
import { PostsImagesService } from './image/images.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostsModel,
      ImageModel,
    ]),
    AuthModule,
    UsersModule,
    CommonModule,
    
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsImagesService],
})
export class PostsModule {}
