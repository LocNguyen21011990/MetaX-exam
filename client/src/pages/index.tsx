import React from "react";
import Navbar from "../components/NavBar";
import { Flex, Heading, Spinner } from '@chakra-ui/react';
import { useCheckAuth } from "../utils/useCheckAuth";
import Layout from "../components/Layout";

import ChangeNameModal from "../components/ChangeNameModal";

const Index = () => {
    const { data: authData, loading: authLoading } = useCheckAuth()

    if (authLoading) {
        return (<>
                    <Navbar/>
                    <Flex justifyContent='center' alignItems='center' minH='100vh'>
                        <Spinner />
                    </Flex>
                </>)
    }
    else {
        return (
            <Layout>
                <Heading>Your info</Heading>
                <ChangeNameModal authData={authData?.me}/>
            </Layout>
        )
    }
};

export default Index;