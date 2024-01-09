import NonExistentPage from "../../../components/404";
import { Header, Layout } from "../../../components/Header";

// Simply display the default non existent page
export default function CollectionNotFound() {
    return (
        <Layout
            header={<Header />}
        >
            <NonExistentPage />
        </Layout>
    )
}