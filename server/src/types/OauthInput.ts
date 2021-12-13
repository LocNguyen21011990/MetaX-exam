import { Field, InputType } from "type-graphql";

@InputType()
export class OauthInput {
    @Field({ nullable: true })
    provider?: string;

    @Field({ nullable: true })
    providerAccountId?: string;

    @Field({ nullable: true })
    name: string;

    @Field({ nullable: true })
    email?: string;
}