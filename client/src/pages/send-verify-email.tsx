import React, { useEffect, useState } from "react";
import { Box, Button, Heading } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import Wrapper from "../components/Wrapper";
import { MeDocument, SendVerifyEmailMutationVariables, useSendVerifyEmailMutation } from "../generated/graphql";
import { useApolloClient } from '@apollo/client';

const SendVerifyEmail = () => {
    const router = useRouter();
    const client = useApolloClient();    
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');

    const verifyingData = client.readQuery({query: MeDocument});
    
    useEffect(() => {
        if(!verifyingData) {
            router.push('/login');
        }
    }, []);
    
    
    const initialValues: SendVerifyEmailMutationVariables = {
        email: verifyingData && verifyingData.me ? verifyingData.me.email : '',
        userId: verifyingData && verifyingData.me ? verifyingData.me.id : '',
    }
    
    const [sendVerifyEmail, _] = useSendVerifyEmailMutation()

    const onSubmit = async (values: SendVerifyEmailMutationVariables) => {
        const response = await sendVerifyEmail({
            variables: {
                email: values.email,
                userId: values.userId
            }
        })
        
        
        if(response.data?.sendVerifyEmail.success && response.data?.sendVerifyEmail.code === 200) {
            setPreviewUrl(response.data?.sendVerifyEmail.message as string);
        }
        else {
            setError(response.data?.sendVerifyEmail.message as string);
        }
    }

    return (
        <Wrapper>
            <Heading mb={6}>Verify email</Heading>
            <Formik 
            initialValues={initialValues}
            onSubmit={onSubmit}>
            {
                ({isSubmitting}) => (
                    <Form>
                        <Button
                            type='submit'
                            colorScheme='teal'
                            mt={4}
                            isFullWidth
                            isLoading={isSubmitting}
                        >
                            Resend Email Verification
                        </Button>
                    </Form> 
                )
            }
            </Formik>
            <Box mt={4}>
                <div className="product-des" dangerouslySetInnerHTML={{ __html: previewUrl }}></div>
            </Box>
            <Box mt={4} color="red">{error}</Box>
        </Wrapper>
    )
}

export default SendVerifyEmail
