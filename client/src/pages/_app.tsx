import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from "next-auth/react"
import theme from '../theme'
import { AppProps } from 'next/app'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import React from 'react'

const client = new ApolloClient({
  uri: 'http://localhost:2101/graphql',
  cache: new InMemoryCache(),
  credentials: 'include'
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <ApolloProvider client={client}>
        <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
        </ChakraProvider>
      </ApolloProvider>
    </SessionProvider>
  )
}

export default MyApp
