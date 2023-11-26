import { useDispatch, useSelector } from "react-redux";
import useSocket from "../../contexts/Socket";
import { IState } from "../../store";
import useTextContext from "../../contexts/Text";
import { useEffect } from "react";
import luid from "../../utils/luid";
import { landed, onMessage } from "../../reducers/collections";
import { Header, Layout } from "../../components/Header";
import { Link } from "react-router-dom";
import prettyDate from "../../utils/prettyDate";

export default function Collections() {
    const { lastMessage, send } = useSocket();
    const { text, locale } = useTextContext();
    const collections = useSelector((root: IState) => root.collections);
    const dispatch = useDispatch();

    useEffect(() => {
        const acknowledge = luid();
        send("COL.READ", {}, acknowledge);
        dispatch(landed(acknowledge));
    }, []);

    useEffect(() => {
        dispatch(onMessage(lastMessage));
    }, [lastMessage]);

    if (collections.empty) {
        return <p>{text("LOADING")}</p>;
    }

    return (
        <Layout header={<Header />}>
            <div className="grid grid-cols-3 p-4 max-w-6xl gap-y-4 mx-auto">
                {collections.collections.map((col) => (
                    <Link
                        key={col.uuid}
                        to={`/collections/${col.uuid}`}
                        className="group contents"
                    >
                        <p className="font-semibold border-b border-l border-t p-2 group-hover:bg-gray-100">
                            {col.name}
                        </p>
                        <p className="border-b border-t p-2 group-hover:bg-gray-100"></p>
                        <p className="text-sm text-gray-600 border-b border-r border-t p-2 group-hover:bg-gray-100">
                            {
                                prettyDate(col.time, locale)
                            }
                        </p>
                    </Link>
                ))}
            </div>
        </Layout>
    );
}
