import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Knesset } from './knesset';


@Entity()
export class Vote {
    
    @PrimaryColumn()
    id: number;

    @Column({ nullable: true })
    protocol?: number;

    @Column({ nullable: true })
    next?: number;

    @Column({ nullable: true })
    prev?: number;

    @ManyToOne(()=>Knesset, (knesset)=>knesset.votes)
    knesset?: Knesset;
}