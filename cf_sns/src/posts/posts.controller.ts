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
import { DataSource } from 'typeorm';
import { PostsImagesService } from './image/images.service';



@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly imagseService: PostsImagesService
  ) {}

  @Get()
  getPosts(
    @Query() query: PaginatePostDto,
  ) {
    return this.postsService.paginatePosts(query);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostRandom(@User() user: UsersModel){
    await this.postsService.generatePosts(user.id);
    return true;
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  async postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
  ){

    const qr = this.dataSource.createQueryRunner();

    await qr.connect();

    await qr.startTransaction();

    try{
    const post = await this.postsService.createPost(userId,body, qr);

    for(let i=0; i<body.images.length; i++){
      await this.imagseService.createPostImage({
        post,
        order:i,
        path: body.images[i],
        type: ImageModelType.POST_IMAGE,
      });
    }
    await qr.commitTransaction();
    await qr.release();

    return this.postsService.getPostById(post.id);
  }catch(e){
    await qr.rollbackTransaction();
    await qr.release();

    throw new InternalServerErrorException('에러가 발생했습니다.');
  }
  }

  @Patch(':id')
  patchPost(@Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto
  ){
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }

}
