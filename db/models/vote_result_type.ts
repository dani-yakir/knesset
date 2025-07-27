import { Entity, Column, PrimaryColumn, OneToOne, OneToMany } from 'typeorm';
import { VoteDetail } from './vote_detail';

@Entity()
export class VoteResultType {
    @PrimaryColumn()
    id: number

    @Column()
    name: string

    @OneToMany(()=>VoteDetail, vote_detail=>vote_detail.vote, {nullable: true})
    vote_details?: VoteDetail[];
}