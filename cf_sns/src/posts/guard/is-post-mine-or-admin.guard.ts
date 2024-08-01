import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { RolesEnum } from "src/users/const/roles.const";
import { PostsService } from "../posts.service";
import { UsersModel } from "src/users/entities/users.entity";
import { Request } from "express";

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate{
  constructor(
    private readonly postService: PostsService
  ){}
  async canActivate(context: ExecutionContext): Promise<boolean>{
    const req = context.switchToHttp().getRequest() as Request & {user: UsersModel};
    const {user} = req;
    if(!user){
      throw new UnauthorizedException(
        '사용자 정보를 가져올 수 없습니다.',
      )
    }

    if(user.role === RolesEnum.ADMIN){
      return true;
    }

    const params = req.params.postId;

    if(!params){
      throw new BadRequestException(
        'Post ID가 파라미터로 제공돼야 합니다.'
      )
    }
    const isOk = this.postService.isPostMine(
      user.id,
      parseInt(params)
    );

    if(!isOk){
      throw new ForbiddenException(
        '권한이 없습니다.'
      )
    }
    
    return true;
  }
}