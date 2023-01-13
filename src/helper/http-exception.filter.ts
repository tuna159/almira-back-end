import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger: Logger = new Logger('Exception');
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const error_code = message.toString().replace('error.', '');

    console.log(message);
    this.logger.error(`[Exception] - ${message[`message`]}`, message);

    if (status === HttpStatus.NOT_FOUND) {
      response.status(status).json('Not found');
    } else
      response.status(status).json({
        status_code: status,
        data: null,
        error_message: message,
        error_code,
        timestamp: new Date().toISOString(),
        // path: request.url,
      });
  }
}
