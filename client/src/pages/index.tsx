import React from "react";
import Navbar from "../components/NavBar";
import { Heading } from '@chakra-ui/react';
import { useCheckAuth } from "../utils/useCheckAuth";
import Layout from "../components/Layout";

import ChangeNameModal from "../components/ChangeNameModal";

const Index = () => {
    const { data: authData, loading: authLoading } = useCheckAuth()

    if (authLoading || (!authLoading && !authData?.me)) {
        return (<Navbar/>)
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