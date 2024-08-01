import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import e from "express";
import { map, Observable, tap } from "rxjs";

@Injectable()
export class LogInterceptor implements NestInterceptor{
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any>{
    

    const now = new Date();

    const req = context.switchToHttp().getRequest();

    const path = req.originalUrl;

    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

    return next.handle().pipe(
      tap(
        (observable) => console.log(`[REQ] ${path} ${new Date().toLocaleString('kr')} ${new Date().getMilliseconds() - now.getMilliseconds()}`),
      ),
      map(
        (observable) => {
          return{
            message: '응답이 변경됐습니다',
            response: observable,
          }
        }
      ),
      tap(
        (observable) => console.log(observable),
      )
    );
  }
}