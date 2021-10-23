import qs from 'query-string';
import pagination from '@core/constants/pagination';
import { PaginatedResultDto } from '@core/dto/pagination';

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export default class PaginatedResponseInterceptor
  implements NestInterceptor<PaginatedResultDto<any>, any>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {

    const request: Request = context.switchToHttp().getRequest();
    const query = request.query;

    const path = request.path;
    const page = Number(query.page || 1);

    return next.handle().pipe(
      map(({hasNext, hasPrevious, data}) => {
        return {
          next: hasNext ? `${path}?${qs.stringify({page: page + 1, size: query.size} )}` : null,
          data,
          prev: hasPrevious ? `${path}?${qs.stringify({page: page - 1, size: query.size} )}` : null
        }
      })
    );
  }
}
