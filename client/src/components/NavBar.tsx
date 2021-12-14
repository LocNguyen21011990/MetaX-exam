import { Box, Flex, Heading, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import {
	useMeQuery
} from '../generated/graphql'
import MainMenu from './MainMenu'

const Navbar = () => {
	const { data, loading: useMeQueryLoading } = useMeQuery()
	

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
				<MainMenu dataMe={data.me}/>
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