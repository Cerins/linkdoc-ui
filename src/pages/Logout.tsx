import { useEffect } from "react";
import { Header, Layout } from "../components/Header";

export default function Logout() {
    useEffect(() => {
    // TODO further cleans, such as cookie deletion
    // Drops the state of the application
        window.location.href = "/";
    }, []);
    return (
        <Layout header={<Header />}>

        </Layout>
    );
}
