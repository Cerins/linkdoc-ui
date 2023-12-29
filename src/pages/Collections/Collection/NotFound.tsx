import NonExistentPage from "../../../components/404";
import { Header, Layout } from "../../../components/Header";

export default function CollectionNotFound() {
    return (
        <Layout
            header={<Header />}
        >
            <NonExistentPage />
        </Layout>
    )
}