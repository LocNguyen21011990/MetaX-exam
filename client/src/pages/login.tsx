import React from 'react'
import { Formik, Form, FormikHelpers } from 'formik'
import { Box, Button, Heading, HStack, useToast, Link } from '@chakra-ui/react'
import Wrapper from '../components/Wrapper'
import InputField from '../components/InputField'
import { LoginInput, MeDocument, MeQuery, useLoginMutation } from '../generated/graphql'
import { mapFieldErrors } from '../helpers/mapFieldErrors'
import { useRouter } from 'next/router'
import DividerWithText from '../components/DividerWithText'
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import NextLink from 'next/link'
import { signIn } from 'next-auth/react';
import { useCheckOauth } from '../utils/useCheckOauth'

const Login = () => {

    const router = useRouter();
    const toast = useToast();
    useCheckOauth();

    const initialValues: LoginInput = { email: '', password: '' }

    const [loginUser, { loading: _loginUserLoading, error }] = useLoginMutation()

    const onLoginSubmit = async (values: LoginInput, {setErrors}: FormikHelpers<LoginInput>) => {
        const response = await loginUser({
            variables: {
                loginInput: values
            },
            update(cache, {data}) {
                if(data?.login.success) {
                    cache.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: { me: data.login.user }
                    })
                }
                if(!data?.login.success && data?.login.code === 403) {
                    cache.writeQuery({
                        query: MeDocument,
                        data: { me: data.login.user }
                    })
                }
            }
        })

        if(response.data?.login.errors) {
            setErrors(mapFieldErrors(response.data.login.errors));
            if(!response.data?.login.success) {
                switch (response.data?.login.code) {
                    case 404:
                        toast({
                            title: 'Error found',
                            description: response.data?.login.message,
                            status: 'error',
                            duration: 3000,
                            isClosable: true,
                        })
                        router.push('/register')
                        break;
                    case 403:
                        toast({
                            title: 'Error found',
                            description: response.data?.login.message,
                            status: 'error',
                            duration: 3000,
                            isClosable: true,
                        })
                        router.push('/send-verify-email')
                        break;
                    case 500:
                        toast({
                            title: 'Error found',
                            description: response.data?.login.message,
                            status: 'error',
                            duration: 3000,
                            isClosable: true,
                        })
                        break;
                }
            }
        }

        if(response.data?.login.success) {
            toast({
                title: 'Login success',
                description: response.data?.login.message,
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
            router.push('/')
        }
    }

    return (
        <Wrapper>
            <Heading mb={6}>Login to MetaX</Heading>
            <Formik 
            initialValues={initialValues} 
            onSubmit={onLoginSubmit}>
            {
                ({values, isSubmitting}) => (
                    <Form>
                        <Box mt={4}>
                            <InputField
                                name='email'
                                placeholder='Email'
                                label='Email'
                                type='email'
                            />
                        </Box>
                        <Box mt={4}>
                            <InputField
                                name='password'
                                placeholder='Password'
                                label='Password'
                                type='password'
                            />
                        </Box>
                        <Button
                            type='submit'
                            colorScheme='teal'
                            mt={4}
                            isFullWidth
                            disabled={!values.email || !values.password}
                            isLoading={isSubmitting}
                        >
                            Login
                        </Button>
                    </Form> 
                )
            }
            </Formik>
            <HStack justifyContent='space-between' my={4}>
                <NextLink href='/forgot-password'>
                    <Link>Forgot password?</Link>
                </NextLink>
                <NextLink href='/register'>
                    <Link ml='auto'>Register</Link>
                </NextLink>
            </HStack>
            <DividerWithText my={6}>OR</DividerWithText>
            <Button
                isFullWidth
                colorScheme='red'
                leftIcon={<FaGoogle />}
                onClick={() =>
                    signIn("google")
                }
            >
            Log in with Google
            </Button>
            <Box mt={4}>
                <Button
                    isFullWidth
                    colorScheme='blue'
                    leftIcon={<FaFacebook />}
                    onClick={() =>
                        signIn("facebook")
                    }
                >
                Log in with Facebook
                </Button>
            </Box>
        </Wrapper>
    )
}

export default Login
