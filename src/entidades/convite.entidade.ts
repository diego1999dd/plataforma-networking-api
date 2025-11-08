import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Candidatura } from './candidatura.entidade';

@Entity('invitations')
export class Convite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  token: string;

  @Column({ default: false })
  isUsado: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  dataCriacao: Date;

  @OneToOne(() => Candidatura)
  @JoinColumn()
  candidatura: Candidatura;

  @Column()
  candidaturaId: number;
}
