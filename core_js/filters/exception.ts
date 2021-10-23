import LtException from '@core/errors/node/lt_exception';
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost
  } from '@nestjs/common';
  
  @Catch()
  export class LtExceptionsFilter implements ExceptionFilter {
    catch(exception: LtException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();

      response.status(exception.statusCode || 500).json({
        successful: false,
        errorCode: exception.code,
        error: exception.message
      });
    }
  }