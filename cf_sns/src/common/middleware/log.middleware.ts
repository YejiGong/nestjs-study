import { Injectable, NestMiddleware } from "@nestjs/common";

@Injectable()
export class LogMiddleware implements NestMiddleware{
  use(req: any, res: any, next: (error?: Error | any) => void) {
    console.log(`[REQ] ${req.url} ${new Date().toLocaleString('kr')}`)
    next()
  }
}