import { BadRequestException, Injectable, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ){}

  async createUser(user: Pick<UsersModel, 'nickname'|'email'|'password'>){
    const nicknameExists = await this.usersRepository.exists({
      where:{
        nickname:user.nickname,
      }
    });

    if(nicknameExists){
      throw new BadRequestException('이미 존재하는 nickname 입니다.');
    }

    const emailExists = await this.usersRepository.exists({
      where:{
        email: user.email,
      }
    })

    if(emailExists){
      throw new BadRequestException('이미 존재하는 email입니다.');
    }
    
    const userObject = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    const newUser = await this.usersRepository.save(userObject);

    return newUser;
  }

  async getAllUsers(){
    return this.usersRepository.find();
  }

  async getUserByEmail(email: string){
    return this.usersRepository.findOne({
      where:{
        email,
      },
    });
  }
}
