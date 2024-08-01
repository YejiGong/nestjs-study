import { BaseModel } from "src/common/entities/base.entity";
import { UsersModel } from "src/users/entities/users.entity";
import { Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { MessagesModel } from "../messages/entity/messages.entity";

@Entity()
export class ChatsModel extends BaseModel{
  @ManyToMany(() => UsersModel, (user) => user.chats)
  @JoinTable()
  users: UsersModel[];

  @OneToMany(()=> MessagesModel, (message) => message.chat)
  messages: MessagesModel[];
}