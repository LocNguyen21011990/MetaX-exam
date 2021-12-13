import { ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";

@ObjectType({ implements: IMutationResponse })
export class SendMailMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;
}