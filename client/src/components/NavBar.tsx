import { Box, Flex, Heading, Link, Button } from '@chakra-ui/react'
import NextLink from 'next/link'
import {
	MeDocument,
	MeQuery,
	useLogoutMutation,
	useMeQuery
} from '../generated/graphql'
import { signOut } from 'next-auth/react'

const Navbar = () => {
	const { data, loading: useMeQueryLoading } = useMeQuery()
	const [logout, { loading: useLogoutMutationLoading }] = useLogoutMutation()

	const logoutUser = async () => {
		await logout({
			update(cache, { data }) {
				if (data?.logout) {
					signOut({redirect: false}).then(() => {
						cache.writeQuery<MeQuery>({
							query: MeDocument,
							data: { me: null }
						})
					});
				}
			}
		})
	}

	let body

	if (useMeQueryLoading) {
		body = null
	} else if (!data?.me) {
		body = (
			<>
				<NextLink href='/login'>
					<Link color="white" mr={2}>Login</Link>
				</NextLink>
				<NextLink href='/register'>
					<Link color="white">Register</Link>
				</NextLink>
			</>
		)
	} else {
		body = (
			<Flex>
				<Button onClick={logoutUser} isLoading={useLogoutMutationLoading}>
					Logout
				</Button>
			</Flex>
		)
	}

	return (
		<Box bg='teal' p={4}>
			<Flex maxW={800} justifyContent='space-between' align='center' m='auto'>
				<NextLink href='/'>
					<Heading color="white">MetaX</Heading>
				</NextLink>
				<Box>{body}</Box>
			</Flex>
		</Box>
	)
}

export default Navbar