import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membro } from '../entidades/membro.entidade';

export interface CriarMembroData {
  nome: string;
  email: string;
  empresa: string;
  telefone: string;
  funcao: string;
  bio: string;
}

@Injectable()
export class MembrosService {
  constructor(
    @InjectRepository(Membro)
    private repositorioMembro: Repository<Membro>,
  ) {}

  async criarMembro(dados: CriarMembroData): Promise<Membro> {
    const novoMembro = this.repositorioMembro.create(dados);
    return this.repositorioMembro.save(novoMembro);
  }
}
