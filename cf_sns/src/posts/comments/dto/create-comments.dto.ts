import { PickType } from "@nestjs/mapped-types";
import { CommentsModel } from "../entities/comments.entity";

export class CreateCommentsDto extends PickType(CommentsModel, ['comment']){}