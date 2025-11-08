// api/src/entidades/candidatura.entidade.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum StatusCandidatura { // Renomeando o Enum
  PENDING = 'PENDENTE',
  APPROVED = 'APROVADA',
  REJECTED = 'RECUSADA',
}

@Entity('applications') // Mantemos o nome da tabela em inglês ('applications') para padronização de BD.
export class Candidatura { // <-- CLASSE RENOMEADA PARA PORTUGUÊS
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string; 
  
  @Column({ unique: true })
  email: string;

  @Column({ length: 150 })
  empresa: string;
  
  @Column({ type: 'text' })
  motivoParticipacao: string;
  
  @Column({
    type: 'enum',
    enum: StatusCandidatura, // Usando o novo Enum
    default: StatusCandidatura.PENDING,
  })
  status: StatusCandidatura; // Usando o novo Enum
  
  @CreateDateColumn({ type: 'timestamp' })
  dataCriacao: Date;
}