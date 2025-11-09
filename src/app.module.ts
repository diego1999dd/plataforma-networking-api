import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CandidaturasModule } from './candidaturas/candidaturas.module';
import { ConvitesModule } from './convites/convites.module';
import { MembrosModule } from './membros/membros.module';
import { Candidatura } from './entidades/candidatura.entidade';
import { Membro } from './entidades/membro.entidade';
import { Convite } from './entidades/convite.entidade';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'sua_senha',
      database: process.env.DB_DATABASE || 'networking_db',
      entities: [Candidatura, Membro, Convite],
      synchronize: true,
    }),

    CandidaturasModule,
    ConvitesModule,
    MembrosModule,
    AuthModule,
  ],
})
export class AppModule {}
