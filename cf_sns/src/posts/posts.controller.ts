import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {CreatePostDto} from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { UsersModel } from 'src/users/entities/users.entity';
import { User } from 'src/users/decorator/user.decorator';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { domainToASCII } from 'url';
import { ImageModelType } from 'src/common/entities/image.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { PostsImagesService } from './image/images.service';
import { LogInterceptor } from 'src/common/interceptor/log.interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { IsPostMineOrAdminGuard } from './guard/is-post-mine-or-admin.guard';



@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly imagseService: PostsImagesService
  ) {}

  @Get()
  @IsPublic()
  @UseInterceptors(LogInterceptor)
  getPosts(
    @Query() query: PaginatePostDto,
  ) {
    return this.postsService.paginatePosts(query);
  }

  @Post('random')
  async postPostRandom(@User() user: UsersModel){
    await this.postsService.generatePosts(user.id);
    return true;
  }

  @Get(':id')
  @IsPublic()
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @UseInterceptors(TransactionInterceptor)
  async postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    @QueryRunner() qr: QR,
  ){


    const post = await this.postsService.createPost(userId,body, qr);

    for(let i=0; i<body.images.length; i++){
      await this.imagseService.createPostImage({
        post,
        order:i,
        path: body.images[i],
        type: ImageModelType.POST_IMAGE,
      });
    }

    return this.postsService.getPostById(post.id, qr);
  }

  @Patch(':postId')
  @UseGuards(IsPostMineOrAdminGuard)
  patchPost(@Param('postId', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto
  ){
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @Roles(RolesEnum.ADMIN)
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }

}
