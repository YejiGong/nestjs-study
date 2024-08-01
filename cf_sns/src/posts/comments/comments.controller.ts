import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';
import { UpdateCommentsDto } from './dto/update-comments.dto';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin.guard';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { PostsService } from '../posts.service';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService,
    private readonly postsService: PostsService
  ) {

  }

  @Get()
  @IsPublic()
  getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() dto: PaginateCommentsDto,
  ){
    return this.commentsService.paginateComments(dto, postId)
  }

  @Get(':commentId')
  @IsPublic()
  getComment(
    @Param('commentId', ParseIntPipe) commentId: number,

  ){
    return this.commentsService.getCommentsById(commentId);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postcomment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: CreateCommentsDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR
  ){
    const result = await this.commentsService.createComment(body, postId, user, qr)
    await this.postsService.incrementCommentCount(postId, qr);
    return result;
  }

  @Patch(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  async patchComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentsDto
  ){
    return this.commentsService.updateComment(body, commentId)
  }

  @Delete(':commentId')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async deleteComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @QueryRunner() qr: QR
  ){
    const result = await this.commentsService.deleteComment(commentId, qr);
    await this.postsService.decrementCommentCount(postId, qr);
    return result;
  }
}
