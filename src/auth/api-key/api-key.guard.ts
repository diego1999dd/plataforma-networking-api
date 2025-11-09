import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Para ler a variável de ambiente

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const adminSecret = this.configService.get<string>('ADMIN_SECRET');

    const apiKey =
      request.headers['x-api-key'] || request.headers['authorization'];

    if (!apiKey || apiKey !== adminSecret) {
      return false;
    }

    return true;
  }
}
