import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { useVerifyEmailMutation } from '../generated/graphql'
import { Box } from '@chakra-ui/react'
import Wrapper from '../components/Wrapper';

const VerifyEmail = () => {

    const router = useRouter();
    const [result, setResult] = useState('');
    const [message, setMessage] = useState('');
    const [verifyEmail, _] = useVerifyEmailMutation();
    const {token, userId} = router.query;

    useEffect(() => {
        
        if(!token && !userId) return;
        const verify = async () => {
            const response = await verifyEmail({
                variables: {
                    token: token as string,
                    userId: userId as string
                }
            })

            setMessage(response.data?.verifyEmail.message as string);
            switch(response.data?.verifyEmail.code) {
                case 401:
                    setResult(`
                        Click <a href="/send-verify-email" style="color:#FF0000;">here</a> to get a verification link.
                    `)
                    break
                case 404:
                    setResult(`
                        Click <a href="/register" style="color:#FF0000;">here</a> to register.
                    `)
                    break
                case 200:
                    setResult(`
                        Click <a href="/" style="color:#FF0000;">here</a> to go simple dashboard.
                    `)
                    break
            }
        } 
        verify();
    }, [token, userId]);

    return (
        <Wrapper>
            <Box color="red">{message}</Box>
            <Box mt={4}>
                <div dangerouslySetInnerHTML={{ __html: result }}></div>
            </Box>
        </Wrapper>
    )
}

export default VerifyEmail
