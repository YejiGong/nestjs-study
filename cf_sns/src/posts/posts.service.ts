/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, QueryRunner, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from 'src/common/common.service';
import { POST_IMAGE_PATH, PUBLIC_FOLDER_NAME, PUBLIC_FOLDER_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import {promises} from 'fs';
import { basename, join } from 'path';
import { CreatePostImageDto } from './image/dto/create-image.dto';
import { ImageModel } from 'src/common/entities/image.entity';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(PostsModel)
        private readonly postsRepository: Repository<PostsModel>,
        @InjectRepository(ImageModel)
        private readonly imagesRepository: Repository<ImageModel>,
        private readonly commonService: CommonService
    ){}

    async getAllPosts(){
        return this.postsRepository.find({
            ...DEFAULT_POST_FIND_OPTIONS
        });
    }

    async generatePosts(userId: number){
        for(let i=0; i<100; i++){
            await this.createPost(userId,
                {title: 'test post',
                content: 'test post',
                images:[],
            });
        }
    }

    async paginatePosts(dto: PaginatePostDto){
        return this.commonService.paginate(
            dto,
            this.postsRepository,
            {
               ...DEFAULT_POST_FIND_OPTIONS
            },
            'posts'
        );
        
    }


    async getPostById(id: number){
        const post = await this.postsRepository.findOne({
            where:{
                id,
            },
            ...DEFAULT_POST_FIND_OPTIONS,
        });
        if(!post){
            throw new NotFoundException();
        }
        return post;
    }


    getRepository(qr?: QueryRunner){
        return qr ? qr.manager.getRepository<PostsModel>(PostsModel) : this.postsRepository;
    }
    async createPost(authorId: number, postDto: CreatePostDto, qr?: QueryRunner){
        const repository =this.getRepository(qr);
        
        const post = repository.create({
            author:{
                id: authorId
            },
            ...postDto,
            images:[],
            likeCount: 0,
            commentCount: 0,
        });
        const newPost = await repository.save(post);
      
        return newPost;
    }

    async updatePost(postId:number, postDto: UpdatePostDto){
        const {title, content} = postDto;
        const post = await this.postsRepository.findOne({
            where:{
                id:postId,
            }
        });

        if(!post){
            throw new NotFoundException();
        }


        if(title){
            post.title = title;
        }

        if(content){
            post.content = content;
        }

        const newPost = await this.postsRepository.save(post);

        return newPost;
    }

    async deletePost(postId:number){
        const post = await this.postsRepository.findOne({
            where:{
                id:postId,
            }
        });
        if (!post) {
        throw new NotFoundException();
        }
        await this.postsRepository.delete(postId);
        return postId;
    }
}
