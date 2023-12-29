import NonExistentPage from "../components/404";
import { Header, Layout } from "../components/Header";

export default function NotFound() {
    return (
        <Layout
            header={<Header />}
        >
            <NonExistentPage />
        </Layout>
    )
}