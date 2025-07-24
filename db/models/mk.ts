import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable} from 'typeorm';
import { Faction } from './faction';


@Entity()
export class Mk {
    @PrimaryColumn()
    id: number

    @Column()
    name: string

    @JoinTable()
    @ManyToMany(() => Faction, (faction) => faction.mks)
    factions: Faction[]
}