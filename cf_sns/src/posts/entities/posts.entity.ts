import { Transform } from "class-transformer";
import { IsString } from "class-validator";
import { join } from "path";
import { POST_PUBLIC_IMAGE_PATH } from "src/common/const/path.const";
import { BaseModel } from "src/common/entities/base.entity";
import { ImageModel } from "src/common/entities/image.entity";
import { stringValidationMessage } from "src/common/validation-message/string-validation.message";
import { UsersModel } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CommentsModel } from "../comments/entities/comments.entity";

@Entity()
export class PostsModel extends BaseModel{
    @ManyToOne(()=>UsersModel, (user)=> user.posts,{
        nullable: false,
    })
    author: UsersModel;
    @IsString({message: stringValidationMessage})
    @Column()
    title: string;
    @IsString({message: stringValidationMessage})
    @Column()
    content: string;
    @Column({
        nullable: true,
    })
    @Column()
    likeCount: number;
    @Column()
    commentCount: number;

    @OneToMany(() => ImageModel, (image) => image.post)
    images: ImageModel[];

    @OneToMany(() => CommentsModel, (comment) => comment.post)
    comments: CommentsModel[];
}