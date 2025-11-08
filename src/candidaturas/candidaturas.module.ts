// api/src/candidaturas/candidaturas.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidaturasService } from './candidaturas.service';
import { CandidaturasController } from './candidaturas.controller';
// Mude o caminho de importação:
import { Application } from '../entidades/application.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Application]), 
  ],
  controllers: [CandidaturasController],
  providers: [CandidaturasService],
})
export class CandidaturasModule {}