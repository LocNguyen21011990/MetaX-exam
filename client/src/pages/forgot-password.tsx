import Wrapper from '../components/Wrapper'
import { Formik, Form } from 'formik'
import InputField from '../components/InputField'
import { Box, Button, Flex, Spinner, Link, Heading } from '@chakra-ui/react'
import {
	ForgotPasswordInput,
	useForgotPasswordMutation
} from '../generated/graphql'
import { useCheckAuth } from '../utils/useCheckAuth'
import NextLink from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'

const ForgotPassword = () => {
	const { data: authData, loading: authLoading } = useCheckAuth()
	const { query } = useRouter();

	console.log({authData, authLoading})

	const initialValues = { email: '', isChangePassword: query.isChangePassword } as ForgotPasswordInput;
    const [emailLink, setEmailLink] = useState('');
    const [error, setError] = useState('');

	const [forgotPassword, { loading, data }] = useForgotPasswordMutation()

	const onForgotPasswordSubmit = async (values: ForgotPasswordInput) => {
		const response = await forgotPassword({ variables: { forgotPasswordInput: values } });

        if(response.data?.forgotPassword.success && response.data?.forgotPassword.code === 200) {
            setEmailLink(response.data?.forgotPassword.message as string);
        }
        else {
            setError(response.data?.forgotPassword.message as string);
        }
	}

	if (authLoading) {
		return (
			<Flex justifyContent='center' alignItems='center' minH='100vh'>
				<Spinner />
			</Flex>
		)
	} else
		return (
			<Wrapper>
                <Heading mb={6}>Forgot Password</Heading>
				<Formik initialValues={initialValues} onSubmit={onForgotPasswordSubmit}>
					{({ values, isSubmitting }) =>
						!loading && data ? (
							<Box dangerouslySetInnerHTML={{ 
								__html: data.forgotPassword.code === 200 
								? emailLink 
								: `${error} Please click <a href="/register" style="color:#FF0000;">here</a> to register your account.`
							}}></Box>
						) : (
							<Form>
								<InputField
									name='email'
									placeholder='Email'
									label='Email'
									type='email'
								/>

								<Flex mt={2}>
									<NextLink href='/login'>
										<Link>Back to Login</Link>
									</NextLink>
								</Flex>
                                <Button
                                    type='submit'
                                    colorScheme='teal'
                                    mt={4}
                                    isFullWidth
                                    disabled={!values.email}
                                    isLoading={isSubmitting}
                                >
                                    Send Reset Password Email
                                </Button>
							</Form>
						)
					}
				</Formik>
			</Wrapper>
		)
}

export default ForgotPassword