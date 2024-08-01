import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter{
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const status = exception.getStatus();

    response
    .status(status)
    .json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toLocaleString('kr'),
      path: req.url,
    });
  }
}