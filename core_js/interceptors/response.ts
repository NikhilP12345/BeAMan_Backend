import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export default class ResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response: ExpressResponse = context.switchToHttp().getResponse();
    const headers = response.getHeaders();
    
    return next.handle().pipe(
      map((data) => {
        if ('content-disposition' in headers && headers['content-disposition'].toString().indexOf('attachment') !== -1 ){
          return data;
        } else if (typeof data == "object" && ('next' in data || 'prev' in data)) {
          return {
            successful: true,
            ...data
          }
        } else {
          return {
            successful: true,
            data
          }
        }
      }),
    );
  }
}
