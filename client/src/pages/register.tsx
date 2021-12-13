import React from 'react'
import { Formik, Form, FormikHelpers } from 'formik'
import { Box, Button, Heading, HStack, Link, useToast } from '@chakra-ui/react'
import Wrapper from '../components/Wrapper'
import InputField from '../components/InputField'
import { RegisterInput, useRegisterMutation } from '../generated/graphql'
import { mapFieldErrors } from '../helpers/mapFieldErrors'
import { useRouter } from 'next/router'
import DividerWithText from '../components/DividerWithText'
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import NextLink from 'next/link'
import { signIn } from 'next-auth/react'
import { useCheckOauth } from '../utils/useCheckOauth'

const Register = () => {

    const router = useRouter();
    const toast = useToast();
    useCheckOauth();

    const initialValues: RegisterInput = { email: '', password: '' }

    const [registerUser, { loading: _registerUserLoading, error }] = useRegisterMutation()

    const onRegisterSubmit = async (values: RegisterInput, {setErrors}: FormikHelpers<RegisterInput>) => {
        const response = await registerUser({
            variables: {
                registerInput: values
            }
        })

        if(response.data?.register.errors) {
            setErrors(mapFieldErrors(response.data.register.errors));
            if(response.data.register.code === 400) {
                toast({
                    title: 'Error found',
                    description: response.data?.register.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                })
            }
        }
        else if(response.data?.register.user) {
            toast({
                title: 'Register success',
                description: response.data?.register.message,
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
            router.push('/login')
        }
    }

    return (
        <Wrapper>
            <Heading mb={6}>Register to MetaX</Heading>
            <Formik 
            initialValues={initialValues} 
            onSubmit={onRegisterSubmit}>
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
                            Register
                        </Button>
                    </Form> 
                )
            }
            </Formik>
            <HStack justifyContent='space-between' my={4}>
                <NextLink href='/login'>
                    <Link>You have account?</Link>
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
            Sign in with Google
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
                Sign in with Facebook
                </Button>
            </Box>
        </Wrapper>
    )
}

export default Register
