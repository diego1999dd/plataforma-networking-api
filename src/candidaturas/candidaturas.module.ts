import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidaturasService } from './candidaturas.service';
import { CandidaturasController } from './candidaturas.controller';
import { Candidatura } from '../entidades/candidatura.entidade'; // <-- CORRIGIDO!

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidatura]), // <-- CORRIGIDO!
  ],
  controllers: [CandidaturasController],
  providers: [CandidaturasService],
})
export class CandidaturasModule {}