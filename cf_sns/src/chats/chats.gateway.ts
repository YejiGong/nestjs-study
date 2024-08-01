import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CreateChatDto } from "./dto/create-chat.dto";
import { ChatsService } from "./chats.service";
import { EnterChatDto } from "./dto/enter-chat.dto";
import { CreateMessagesDto } from "./messages/dto/create-message.dto";
import { ChatsMessagesService } from "./messages/messages.service";
import { UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { SocketCatchHttpExceptionFilter } from "src/common/exception-filter/socket-catch-http.exception-filter";
import { SocketBearerTokenGuard } from "src/auth/guard/socket/socket-bearer-token.guard";
import { UsersModel } from "src/users/entities/users.entity";
import { UsersService } from "src/users/users.service";
import { AuthService } from "src/auth/auth.service";

@WebSocketGateway({
  namespace: 'chats'
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect{
  constructor(
    private readonly chatService: ChatsService,
    private readonly messageService: ChatsMessagesService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ){}

  @WebSocketServer()
  server: Server;

  afterInit(server: any) {
    console.log(`after gateway init`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`on disconnect called: ${socket.id}`)
  }

  async handleConnection(socket: Socket & {user: UsersModel}) {
    const headers = socket.handshake.headers;
    const rawToken = headers['authorization'];
    if(!rawToken){
      socket.disconnect();
    }

    try{
      const token = this.authService.extractTokenFromHeader(
        rawToken, 
        true,
      );

      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);
      socket.user = user;

    }catch(e){
      socket.disconnect();
    }
  }

  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions:{
      enableImplicitConversion: true
    },
    whitelist: true,
    forbidNonWhitelisted:true,
  }))
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket & {user: UsersModel},
  ){
    const chat = await this.chatService.createChat(data,);
  }

  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions:{
      enableImplicitConversion: true
    },
    whitelist: true,
    forbidNonWhitelisted:true,
  }))
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('enter_chat')
  async enterChat(
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket & {user: UsersModel}
  ){
    for(const chatId of data.chatIds){
      const exists = await this.chatService.checkIfChatExists(chatId);
      if(!exists){
        throw new WsException({
          code: 100,
          message: `존재하지 않는 chat 입니다. chatId: ${chatId}`
        });
      }
    }
    socket.join(data.chatIds.map((x) => x.toString()));
  }


  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions:{
      enableImplicitConversion: true
    },
    whitelist: true,
    forbidNonWhitelisted:true,
  }))
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket & {user: UsersModel},
  ){

    const chatExists = await this.chatService.checkIfChatExists(dto.chatId);
    if(!chatExists){
      throw new WsException({
        code: 100,
        message: `존재하지 않는 chat 입니다. chatId: ${dto.chatId}`
      });
    }

    const message = await this.messageService.createMessage(dto, socket.user.id);
    console.log(message);
    socket.to(message.chat.id.toString()).emit("receive_message", message.message);
    //this.server.in(message.chatId.toString()).emit('receive_message', 'hello from server');
  }
}