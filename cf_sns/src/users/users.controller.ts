import { Body, ClassSerializerInterceptor, Controller, DefaultValuePipe, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from './decorator/roles.decorator';
import { RolesEnum } from './const/roles.const';
import { User } from './decorator/user.decorator';
import { UsersModel } from './entities/users.entity';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import {QueryRunner as QR} from 'typeorm';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // postUser(
  //   @Body('nickname') nickname: string,
  //   @Body('email') email: string,
  //   @Body('password') password: string
  // ){
  //   return this.usersService.createUser({nickname, email, password});
  // }

  @Get()
  @Roles(RolesEnum.ADMIN)
  getUsers(){
    return this.usersService.getAllUsers();
  }

  @Get('follow')
  async getFollow(
    @User() user: UsersModel,
    @Query('includeNotConfirmed', ParseBoolPipe, new DefaultValuePipe(false)) includeNotConfirmed: boolean
  ){
    return this.usersService.getFollowers(user.id, includeNotConfirmed);
  }
  @Post('follow/:id')
  @UseInterceptors(TransactionInterceptor)
  async postFollow(
    @User() user:UsersModel,
    @Param('id', ParseIntPipe) followeeId: number,
    @QueryRunner() qr: QR
  ){
    await this.usersService.followUser(
      user.id,
      followeeId,
      qr
    )

    return true;
  }

  @Patch('follow/:id/confirm')
  @UseInterceptors(TransactionInterceptor)
  async patchFollowConfirm(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followerId: number,
    @QueryRunner() qr: QR

  ){
    await this.usersService.confirmFollow(followerId, user.id, qr);
    await this.usersService.incrementFollowerCount(user.id, qr);
    await this.usersService.incrementFolloweeCount(followerId, qr);
    return true;
  }

  @Delete('follow/:id')
  @UseInterceptors(TransactionInterceptor)
  async deleteFollow(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followeeId: number,
    @QueryRunner() qr: QR
  ){
    await this.usersService.deleteFollow(
      user.id,
      followeeId,
      qr
    );
    await this.usersService.decrementFollowerCount(user.id, qr);
    await this.usersService.decrementFolloweeCount(followeeId, qr);
    return true;
  }
}
