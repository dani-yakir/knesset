import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Faction } from './faction';
import { Vote } from './vote';


@Entity()
export class Knesset {
    @PrimaryColumn()
    id: number

    @Column()
    name: string

    @Column({ type: 'date', nullable: true})
    start_date: string

    @Column({ type: 'date', nullable: true })
    end_date: string | null
    
    @Column()
    is_current: boolean

    @OneToMany(()=>Faction, (faction)=>{faction.knesset})
    factions: Faction[];

    @OneToMany(()=>Vote, (vote)=>{vote.knesset})
    votes: Vote[];
}