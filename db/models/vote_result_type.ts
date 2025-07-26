import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';

@Entity()
export class VoteResultType {
    @PrimaryColumn()
    id: number

    @Column()
    name: string
}