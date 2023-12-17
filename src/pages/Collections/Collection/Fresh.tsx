import { Header, Layout } from "../../../components/Header";
import Spinner from "../../../components/Spinner";

export default function CollectionFresh() {
    {
    /* TODO Fancier loading animation */
    }

    return (
        <div className="h-screen">
            <Layout header={<Header />}>
                <div className="flex flex-column justify-center h-full">
                    <Spinner />
                </div>
            </Layout>
        </div>
    );
}