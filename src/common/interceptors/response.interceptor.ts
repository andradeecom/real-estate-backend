import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 200:
      return 'OK';
    case 201:
      return 'Created';
    case 204:
      return 'No Content';
    default:
      return 'Success';
  }
}

function isAlreadyWrapped(value: any): boolean {
  return (
    value &&
    typeof value === 'object' &&
    'code' in value &&
    'message' in value &&
    'data' in value
  );
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, { code: number; message: string; data: T }>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ code: number; message: string; data: T }> {
    const res = context.switchToHttp().getResponse();
    const customMessage =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ??
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getClass());

    return next.handle().pipe(
      map((data: any) => {
        const statusCode = res?.statusCode ?? 200;

        // Don’t wrap if already wrapped
        if (isAlreadyWrapped(data)) return data;

        // Don’t send body for 204
        if (statusCode === 204) {
          return undefined as any;
        }

        return {
          code: statusCode,
          message: customMessage ?? defaultMessageForStatus(statusCode),
          data,
        };
      }),
    );
  }
}

