import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from "next-auth/react"
import theme from '../theme'
import { AppProps } from 'next/app'
import { ApolloProvider } from '@apollo/client'
import React from 'react'
import { useApollo } from '../lib/apolloClient'

function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps);
  return (
    <SessionProvider>
      <ApolloProvider client={apolloClient}>
        <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
        </ChakraProvider>
      </ApolloProvider>
    </SessionProvider>
  )
}

export default MyApp
