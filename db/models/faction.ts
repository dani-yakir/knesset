import { Entity, Column, PrimaryColumn, ManyToOne, ManyToMany, JoinTable} from 'typeorm';
import { Knesset } from './knesset';
import { Mk } from './mk';


@Entity()
export class Faction {
    @PrimaryColumn()
    id: number

    @Column()
    name: string

    @ManyToOne(() => Knesset, (knesset) => knesset.factions)
    knesset: Knesset
    
    @ManyToMany(()=>Mk, (mk)=>mk.factions)
    mks: Mk[]
}