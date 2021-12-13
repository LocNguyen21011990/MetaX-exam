import { Box, Flex } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface IWrapperProps {
    children: ReactNode
}

const Wrapper = ({ children }: IWrapperProps) => {
    return (
        <Flex height="100vh" alignItems="center" justifyContent="center">
            <Box direction="column" background="gray.100" p={6} rounded={6} maxW="400px" w="100%">
                {children}
            </Box>

        </Flex>
    )
}

export default Wrapper
