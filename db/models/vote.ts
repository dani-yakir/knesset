import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany } from 'typeorm';
import { Knesset } from './knesset';
import { LawItem } from './law_item';
import { VoteDetail } from './vote_detail';


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

    @ManyToOne(()=>Knesset, (knesset)=>knesset.votes, {nullable: true})
    knesset?: Knesset;

    @ManyToOne(()=>LawItem, law_item=>law_item.votes, {nullable: true})
    law_item?: LawItem

    @OneToMany(()=>VoteDetail, vote_detail=>vote_detail.vote, {nullable: true, cascade: true})
    vote_details?: VoteDetail[];

    @Column({ nullable: true })
    date: Date;
}