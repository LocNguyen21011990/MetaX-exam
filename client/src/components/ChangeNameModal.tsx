import React, { useState } from "react";
import { Box, Button, useDisclosure, useToast } from '@chakra-ui/react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
  } from '@chakra-ui/react'
import { Form, Formik } from "formik";
import InputField from "../components/InputField";
import { MeDocument, MeQuery, ResetNameInput, useResetNameMutation } from "../generated/graphql";
import { EditIcon } from "@chakra-ui/icons";

const ChangeNameModal = props => {
    const [resetName, { loading, data }] = useResetNameMutation()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast();

    const [authData, setAuthData] = useState(props.authData);
    const initialValues = { name: authData.name }
    const [ error, setError ] = useState('');

    const onResetNameSubmit = async (values: ResetNameInput) => {
        const response = await resetName({ 
            variables: { resetNameInput: values },
            update: (cache, { data }) => {
                if (data?.resetName.success) {
                    cache.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: { me: data.resetName.user }
                    })
                    setAuthData(data?.resetName.user);
                    
                }
            }
        });

        if(response.data?.resetName.success && response.data?.resetName.code === 200) {
            toast({
                title: 'Change name success',
                description: response.data?.resetName.message,
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
            onClose();
        }
        else {
            setError(response.data?.resetName.message as string);
        }
    }
    return (
        <>
            <Box mt={4}>Email: {authData.email}</Box>
            <Box mt={4} >{authData.name ?? ''} {authData.name ? <EditIcon onClick={onOpen} color='teal' _hover={{ cursor: 'pointer' }}/> : ''}</Box>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Change your name in MetaX</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                    <Formik initialValues={initialValues} onSubmit={onResetNameSubmit}>
                        {({ values, isSubmitting }) =>
                            !loading && data ? (
                                <Box dangerouslySetInnerHTML={{ __html: data.resetName.code === 200 ? emailLink : error }}></Box>
                            ) : (
                                <Form>
                                    <InputField
                                        name='name'
                                        placeholder='Name'
                                        label='Name'
                                        type='text'
                                    />
                                    <Button
                                        type='submit'
                                        colorScheme='teal'
                                        mt={4}
                                        isFullWidth
                                        disabled={!values.name}
                                        isLoading={isSubmitting}
                                    >
                                        Save
                                    </Button>
                                </Form>
                            )
                        }
                    </Formik>
                    </ModalBody>
                    <ModalFooter>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default ChangeNameModal
