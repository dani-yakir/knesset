import { Entity, Column, PrimaryColumn, ManyToOne} from 'typeorm';
import { Knesset } from './knesset';


@Entity()
export class Faction {
    @PrimaryColumn()
    id: number

    @Column()
    name: string

    @ManyToOne(() => Knesset, (knesset) => knesset.factions)
    knesset: Knesset
}