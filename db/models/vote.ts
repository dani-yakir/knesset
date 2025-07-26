import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Knesset } from './knesset';


@Entity()
export class Vote {
    
    @PrimaryColumn()
    id: number;

    @Column()
    protocol: number;

    @ManyToOne(()=>Knesset, (knesset)=>knesset.votes)
    knesset: Knesset;
}