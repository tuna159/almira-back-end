import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger: Logger = new Logger('Request');

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.warn(
      ` [${req.method}] ${req.originalUrl} ${JSON.stringify(req.body)}`,
    );
    next();
  }
}
