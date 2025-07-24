import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable} from 'typeorm';
import { Faction } from './faction';


@Entity()
export class Mk {
    @PrimaryColumn()
    id: number

    @Column()
    name: string

    @ManyToMany(() => Faction, (faction) => faction.mks)
    @JoinTable({
        name: 'assoc_mk_faction', // Custom join table name
        joinColumn: {
            name: 'mk_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'faction_id',
            referencedColumnName: 'id'
        }

    })
    factions: Faction[]
}