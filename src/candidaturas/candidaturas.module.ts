import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidaturasService } from './candidaturas.service';
import { CandidaturasController } from './candidaturas.controller';
import { Candidatura } from '../entidades/candidatura.entidade';
import { ConvitesModule } from 'src/convites/convites.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidatura]),
    ConvitesModule,
    ConfigModule,
  ],
  controllers: [CandidaturasController],
  providers: [CandidaturasService],
})
export class CandidaturasModule {}
