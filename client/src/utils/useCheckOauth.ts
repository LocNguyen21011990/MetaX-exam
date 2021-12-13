import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { MeDocument, MeQuery, useOAuthMutation } from '../generated/graphql'
import { useSession } from 'next-auth/react'
import { useToast } from '@chakra-ui/react'

export const useCheckOauth = () => {
	const router = useRouter();
    const toast = useToast();

	const { data: sessionData, status } = useSession();
    const [oAuth, _] = useOAuthMutation();

    useEffect(() => {
        if(status === "loading" || !sessionData) return;
        const verify = async () => { 
            const responseOauth = await oAuth({
                variables: {
                    oauthInput: {
                        email: sessionData?.user?.email,
                        name: sessionData?.user?.name,
                        provider: sessionData?.provider as string,
                        providerAccountId: sessionData?.providerAccountId as string
                    }
                },
                update(cache, {data}) {
                    if(data?.oAuth.success === true) {
                        cache.writeQuery<MeQuery>({
                            query: MeDocument,
                            data: { me: data?.oAuth.user }
                        })
                    }
                }
            })

            if(responseOauth.data?.oAuth.success) {
                toast({
                    title: 'Login success',
                    description: responseOauth.data?.oAuth.message,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                })
                router.push('/')
            }
            else {
                toast({
                    title: 'Error found',
                    description: responseOauth.data?.oAuth.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                })
            }
        }
        verify();
    }, [sessionData, status]);
}