import { Membro } from './../entidades/membro.entidade';
import { Convite } from './../entidades/convite.entidade';
import { Candidatura } from './../entidades/candidatura.entidade';
import { Module } from '@nestjs/common';
import { ConvitesController } from './convites.controller';
import { ConvitesService } from './convites.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // 2. Use TypeOrmModule.forFeature() para registrar as entidades
    TypeOrmModule.forFeature([
      Convite,
      Candidatura, // Para que o serviço possa atualizar o status
      Membro, // Se o ConvitesService for responsável por criar o membro no cadastro final
    ]),
  ],
  controllers: [ConvitesController],
  providers: [ConvitesService],
  // 3. Opcional: exportar o serviço para uso em outros módulos
  exports: [ConvitesService],
})
export class ConvitesModule {}
