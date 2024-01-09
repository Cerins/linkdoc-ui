import NonExistentPage from "../components/404";
import { Header, Layout } from "../components/Header";

// Simply display the default non existent page
// If users visits a non existent page
export default function NotFound() {
    return (
        <Layout
            header={<Header />}
        >
            <NonExistentPage />
        </Layout>
    )
}