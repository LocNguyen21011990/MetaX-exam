import { IsChangePassword } from '../constants'
import { Field, InputType } from 'type-graphql'

@InputType()
export class ForgotPasswordInput {
	@Field()
	email: string

	@Field()
	isChangePassword: string = IsChangePassword.No // y: change password, n: forgot password
}