import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

@ObjectType() //talk to graphql
@Entity() //db table
export class OauthAccount extends BaseEntity {
    @Field(_type => String)
    @PrimaryColumn()
    id: string = uuidv4();

    @Field()
    @Column({nullable: true})
    provider?: string;

    @Column({unique: true})
    providerAccountId?: string;

    @Field()
	@Column()
	userId!: string

    @Field(_type => User)
	@ManyToOne(() => User, user => user.accounts)
	user: User

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;
}