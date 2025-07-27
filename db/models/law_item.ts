import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Vote } from './vote';

@Entity()
export class LawItem {
    
    @PrimaryColumn()
    id: number;

    @Column()
    title: string;

    @OneToMany(()=>Vote, (vote)=>vote.law_item)
    votes: Vote[];
}