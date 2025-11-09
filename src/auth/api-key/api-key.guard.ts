import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Para ler a variável de ambiente

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Pega o valor da chave secreta configurada no .env
    const adminSecret = this.configService.get<string>('ADMIN_SECRET');

    // 1. Tenta obter a chave do Header (ex: 'x-api-key' ou 'authorization')
    const apiKey =
      request.headers['x-api-key'] || request.headers['authorization'];

    // 2. Verifica se a chave existe e se é igual à chave secreta
    if (!apiKey || apiKey !== adminSecret) {
      // Retorna false, o que resulta em um 403 Forbidden
      return false;
    }

    // Se o segredo for válido, permite o acesso
    return true;
  }
}
