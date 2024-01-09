import { useEffect } from "react";
import { Header, Layout } from "../components/Header";
import { logout } from "../services/login";
import Spinner from "../components/Spinner";

// Simply try to logout and reset the state
export default function Logout() {
    useEffect(() => {
        // TODO further cleans, such as cookie deletion
        // Drops the state of the application
        logout().catch(()=>{}).finally(()=>{
            window.location.href = "/";
        });
    }, []);
    return (
        <Layout header={<Header />}>

            <div className="flex h-full items-center justify-center">
                <Spinner />
            </div>
        </Layout>
    );
}
