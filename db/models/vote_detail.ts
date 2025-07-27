import { Entity, Column, PrimaryColumn,  OneToMany, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Vote } from './vote';
import { VoteResultType } from './vote_result_type';


@Entity()
export class VoteDetail {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    mk_name: string;

    @Column({nullable: true})
    faction_name?: string;

    @ManyToOne(()=>Vote, vote=>vote.vote_details)
    vote: Vote;

    @ManyToOne(()=>VoteResultType, (vote_result_type)=>vote_result_type.vote_details)
    vote_result_type: VoteResultType;
}