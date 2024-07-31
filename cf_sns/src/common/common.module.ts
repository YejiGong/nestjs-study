import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { POST_IMAGE_PATH, TEMP_FOLDER_NAME, TEMP_FOLDER_PATH } from './const/path.const';
import {v4 as uuid} from 'uuid';
import { extname } from 'path';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports:[
    AuthModule,
    MulterModule.register({
      limits:{
        fileSize: 10000000,
      },
      fileFilter:(req,file,cb) => {
        const ext = extname(file.originalname);
        if(ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png'){
          return cb(
            new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다.'),
            false,
          );
        }

        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: function(req, res, cb){
          cb(null, TEMP_FOLDER_PATH);
        },
        filename: function(req,file,cb){
          cb(null, `${uuid()}${extname(file.originalname)}`)
        }
      })
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService]
})
export class CommonModule {}
