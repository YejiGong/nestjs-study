import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseWsExceptionFilter } from "@nestjs/websockets";

@Catch(HttpException)
export class SocketCatchHttpExceptionFilter extends BaseWsExceptionFilter<HttpException>{
  catch(exception: HttpException, host: ArgumentsHost): void {
    super.catch(exception, host);

    const socket = host.switchToWs().getClient();

    socket.emit(
      'exception',
      {
        data: exception.getResponse()
      }
    )
  }
}