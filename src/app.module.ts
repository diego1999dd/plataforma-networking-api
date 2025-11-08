// api/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Necessário para .env
import { CandidaturasModule } from './candidaturas/candidaturas.module';
import { ConvitesModule } from './convites/convites.module';
import { MembrosModule } from './membros/membros.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Carrega o .env
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'sua_senha',
      database: process.env.DB_DATABASE || 'networking_db',
      entities: [
        // Importar suas entidades aqui: Application, Invitation, Member...
      ],
      synchronize: true, // APENAS PARA DESENVOLVIMENTO
    }),
    CandidaturasModule,
    ConvitesModule,
    MembrosModule,
  ],
})
export class AppModule {}
