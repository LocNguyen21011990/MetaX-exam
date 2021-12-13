import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OauthAccount } from './OauthAccount';

@ObjectType() //talk to graphql
@Entity() //db table
export class User extends BaseEntity {
    @Field(_type => String)
    @PrimaryColumn()
    id: string = uuidv4();

    @Field()
    @Column({unique: true})
    email!: string;

    @Column()
    password!: string;

    @Field()
    @Column({default: false})
    isVerified: boolean;

    @Field({ nullable: true })
    @Column({nullable: true})
    name: string;

    @OneToMany(() => OauthAccount, account => account.user)
	accounts: OauthAccount[]

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;
}