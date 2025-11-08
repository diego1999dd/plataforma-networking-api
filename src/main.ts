import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- Import necessário

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilita a validação de DTOs globalmente
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Garante que DTOs sejam tipados
  }));

  // Define um prefixo global para a API, se desejar (Ex: app.setGlobalPrefix('api');)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();