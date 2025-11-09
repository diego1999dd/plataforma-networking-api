// api/src/convites/convites.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid'; // Importa a função de geração de UUID
import { Convite } from '../entidades/convite.entidade';
import {
  Candidatura,
  StatusCandidatura,
} from '../entidades/candidatura.entidade';

@Injectable()
export class ConvitesService {
  constructor(
    @InjectRepository(Convite)
    private repositorioConvite: Repository<Convite>,
  ) {}

  async gerarConvite(candidaturaId: number): Promise<Convite> {
    // 1. Gera o token único
    const tokenUnico = uuidv4();

    // 2. Cria o objeto Convite
    const novoConvite = this.repositorioConvite.create({
      token: tokenUnico,
      candidaturaId: candidaturaId,
      isUsado: false,
    });

    // 3. Salva no banco de dados
    const conviteSalvo = await this.repositorioConvite.save(novoConvite);

    // 4. Simula o envio do link por e-mail (console.log é suficiente para o teste)
    console.log(
      `[E-MAIL] Link de Cadastro Gerado para o ID ${candidaturaId}: http://localhost:3000/cadastro/${tokenUnico}`,
    );

    return conviteSalvo;
  }
  // ... (futuros métodos para validar e completar cadastro)
}
