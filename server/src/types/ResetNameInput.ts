import { Field, InputType } from "type-graphql";

@InputType()
export class ResetNameInput {
    @Field()
    name!: string;
}