import { Context } from '../types/Context'
import { MiddlewareFn } from 'type-graphql'
import { AuthenticationError } from 'apollo-server-express'

export const checkAuth: MiddlewareFn<Context> = (
	{ context: { req } },
	next
) => {
	console.log('REQUEST', req)
	if (!req.session.userId)
		throw new AuthenticationError(
			'Not authenticated to perform GraphQL operations'
		)

	return next()
}