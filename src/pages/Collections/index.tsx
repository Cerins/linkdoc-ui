import { useDispatch, useSelector } from "react-redux";
import useSocket from "../../contexts/Socket";
import { IState } from "../../store";
import useTextContext from "../../contexts/Text";
import { useEffect } from "react";
import luid from "../../utils/luid";
import { landed, onMessage } from "../../reducers/collections";
import { Header, Layout } from "../../components/Header";
import Spinner from "../../components/Spinner";
import CollectionList from "./List";
import { CollectionCreate } from "./Create";

interface Collection {
  uuid: string;
  name: string;
  user: string;
  time: string;
}

export default function Collections() {
    const { lastMessage, send } = useSocket();
    const { text } = useTextContext();
    const collections = useSelector((root: IState) => root.collections);
    const username = useSelector((root: IState) => root.login.username);
    const dispatch = useDispatch();

    useEffect(() => {
        const acknowledge = luid(username);
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
        <Layout
            header={
                <Header
                    leftItems={<>{collections.status === "loading" && <Spinner />}</>}
                />
            }
        >
            <div className="p-4 mx-auto max-w-6xl flex flex-col gap-2">
                <CollectionCreate collections={collections.collections} />
                <CollectionList collections={collections.collections}></CollectionList>
            </div>
        </Layout>
    );
}

export type { Collection };
